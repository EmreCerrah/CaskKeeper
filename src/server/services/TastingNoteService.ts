/**
 * @file TastingNoteService.ts
 * @description Tadım notu iş mantığı. Sahiplik kontrolü (bir kullanıcı yalnızca
 * kendi notunu görebilir/değiştirebilir/silebilir) bu katmanda zorunlu kılınır.
 */

import mongoose from "mongoose";
import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import type {
  TastingNoteFilterOptions,
  TastingNotePaginationOptions,
} from "../repositories/TastingNoteRepository";
import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import { followRepository } from "../repositories/FollowRepository";
import {
  CreateTastingNoteSchema,
  UpdateTastingNoteSchema,
} from "../validations/tasting-note.schema";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  toTastingNoteDTO,
  type TastingNoteDTO,
  type DashboardStatsDTO,
} from "@/lib/types/dto";

export interface PaginatedNotes {
  data: TastingNoteDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TastingNoteService {
  // ---------- READ ----------

  async getNotesByUser(
    userId: string,
    filters?: TastingNoteFilterOptions,
    pagination?: TastingNotePaginationOptions
  ): Promise<PaginatedNotes> {
    const result = await tastingNoteRepository.findByUser(userId, filters, pagination);
    return { ...result, data: result.data.map(toTastingNoteDTO) };
  }

  /** Not sahibi değilse NotFound gibi davranmayız — Forbidden ayrımı loglama için değerli. */
  async getNoteForUser(noteId: string, userId: string): Promise<TastingNoteDTO> {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw new NotFoundError("Tadım notu bulunamadı");
    }
    const note = await tastingNoteRepository.findById(noteId);
    if (!note) throw new NotFoundError("Tadım notu bulunamadı");
    if (String(note.user) !== userId) {
      throw new ForbiddenError("Bu tadım notuna erişim yetkiniz yok");
    }
    return toTastingNoteDTO(note);
  }

  /** Viski detay sayfası: kullanıcının bu viskiye ait tüm tadım seansları */
  async getNotesForWhiskey(userId: string, whiskeyId: string): Promise<TastingNoteDTO[]> {
    const notes = await tastingNoteRepository.findByUserAndWhiskey(userId, whiskeyId);
    return notes.map(toTastingNoteDTO);
  }

  /** Herkese açık profilde gösterilen notlar (yalnızca public) */
  async getPublicNotesByUser(
    userId: string,
    pagination?: TastingNotePaginationOptions
  ): Promise<PaginatedNotes> {
    const result = await tastingNoteRepository.findPublicByUser(userId, pagination);
    return { ...result, data: result.data.map(toTastingNoteDTO) };
  }

  /**
   * Aktivite akışı: kullanıcının takip ettiği kişilerin herkese açık notları.
   * Takip edilen kimse yoksa boş liste döner.
   */
  async getFeed(userId: string, pagination?: TastingNotePaginationOptions): Promise<PaginatedNotes> {
    const followingIds = await followRepository.getFollowingIds(userId);
    const result = await tastingNoteRepository.findFeed(followingIds, pagination);
    return { ...result, data: result.data.map(toTastingNoteDTO) };
  }

  async getDashboardStats(userId: string): Promise<DashboardStatsDTO> {
    const [stats, recent] = await Promise.all([
      tastingNoteRepository.getStatsByUser(userId),
      tastingNoteRepository.findByUser(userId, undefined, {
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    ]);

    return {
      ...stats,
      recentNotes: recent.data.map(toTastingNoteDTO),
    };
  }

  // ---------- WRITE ----------

  async createNote(userId: string, data: unknown): Promise<TastingNoteDTO> {
    const parsed = CreateTastingNoteSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz tadım notu", parsed.error.flatten().fieldErrors);
    }

    // Katalogda gerçekten var olan bir viskiye not yazılabilir
    const whiskey = await whiskeyRepository.findById(parsed.data.whiskey);
    if (!whiskey) throw new NotFoundError("Viski katalogda bulunamadı");

    const note = await tastingNoteRepository.create(userId, parsed.data);
    return toTastingNoteDTO(note);
  }

  async updateNote(noteId: string, userId: string, data: unknown): Promise<TastingNoteDTO> {
    const parsed = UpdateTastingNoteSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz tadım notu", parsed.error.flatten().fieldErrors);
    }

    // Sahiplik kontrolü
    await this.getNoteForUser(noteId, userId);

    const updated = await tastingNoteRepository.update(noteId, parsed.data);
    if (!updated) throw new NotFoundError("Tadım notu bulunamadı");
    return toTastingNoteDTO(updated);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    // Sahiplik kontrolü
    await this.getNoteForUser(noteId, userId);

    const deleted = await tastingNoteRepository.delete(noteId);
    if (!deleted) throw new NotFoundError("Tadım notu bulunamadı");
  }
}

export const tastingNoteService = new TastingNoteService();
