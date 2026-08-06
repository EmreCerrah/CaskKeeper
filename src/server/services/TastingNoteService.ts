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
import { userRepository } from "../repositories/UserRepository";
import { interactionService } from "./InteractionService";
import {
  CreateTastingNoteSchema,
  UpdateTastingNoteSchema,
} from "../validations/tasting-note.schema";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  toTastingNoteDTO,
  toPublicUserDTO,
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
      throw new NotFoundError("errors.tastingNoteNotFound");
    }
    const note = await tastingNoteRepository.findById(noteId);
    if (!note) throw new NotFoundError("errors.tastingNoteNotFound");
    if (String(note.user) !== userId) {
      throw new ForbiddenError("errors.tastingNoteForbidden");
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
    pagination?: TastingNotePaginationOptions,
    viewerId?: string
  ): Promise<PaginatedNotes> {
    const result = await tastingNoteRepository.findPublicByUser(userId, pagination);
    return {
      ...result,
      data: await this.withInteractions(result.data.map(toTastingNoteDTO), viewerId),
    };
  }

  /**
   * Aktivite akışı: kullanıcının takip ettiği kişilerin herkese açık notları.
   * Takip edilen kimse yoksa boş liste döner.
   */
  async getFeed(userId: string, pagination?: TastingNotePaginationOptions): Promise<PaginatedNotes> {
    const followingIds = await followRepository.getFollowingIds(userId);
    const result = await tastingNoteRepository.findFeed(followingIds, pagination);
    return {
      ...result,
      data: await this.withInteractions(result.data.map(toTastingNoteDTO), userId),
    };
  }

  /**
   * Tek bir tadım notunun herkese açık görünümü (kalıcı bağlantı sayfası).
   * Not herkese açık değilse yalnızca sahibi görebilir; başkası için NotFound.
   */
  async getPublicNote(noteId: string, viewerId?: string): Promise<TastingNoteDTO> {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw new NotFoundError("errors.tastingNoteNotFound");
    }

    const note = await tastingNoteRepository.findById(noteId);
    if (!note) throw new NotFoundError("errors.tastingNoteNotFound");

    const authorId = String(note.user);
    if (note.visibility !== "public" && authorId !== viewerId) {
      throw new NotFoundError("errors.tastingNoteNotFound");
    }

    const dto = toTastingNoteDTO(note);

    // findById yazarı populate etmez — kart başlığı için ayrıca çekilir
    const author = await userRepository.findById(authorId);
    if (author) dto.author = toPublicUserDTO(author);

    dto.interactions = await interactionService.getInteractionsForNote(noteId, viewerId);
    return dto;
  }

  /** Not listesine beğeni/yorum özetini toplu olarak ekler (N+1 önlenir). */
  private async withInteractions(
    notes: TastingNoteDTO[],
    viewerId?: string
  ): Promise<TastingNoteDTO[]> {
    if (notes.length === 0) return notes;

    const summaries = await interactionService.getInteractionsFor(
      notes.map((n) => n.id),
      viewerId
    );

    return notes.map((note) => ({
      ...note,
      interactions: summaries.get(note.id) ?? {
        likeCount: 0,
        commentCount: 0,
        isLikedByViewer: false,
      },
    }));
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
      throw new ValidationError("errors.invalidTastingNote", parsed.error.flatten().fieldErrors);
    }

    // Katalogda gerçekten var olan bir viskiye not yazılabilir
    const whiskey = await whiskeyRepository.findById(parsed.data.whiskey);
    if (!whiskey) throw new NotFoundError("errors.whiskeyNotInCatalogue");

    const note = await tastingNoteRepository.create(userId, parsed.data);
    return toTastingNoteDTO(note);
  }

  async updateNote(noteId: string, userId: string, data: unknown): Promise<TastingNoteDTO> {
    const parsed = UpdateTastingNoteSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidTastingNote", parsed.error.flatten().fieldErrors);
    }

    // Sahiplik kontrolü
    await this.getNoteForUser(noteId, userId);

    const updated = await tastingNoteRepository.update(noteId, parsed.data);
    if (!updated) throw new NotFoundError("errors.tastingNoteNotFound");
    return toTastingNoteDTO(updated);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    // Sahiplik kontrolü
    await this.getNoteForUser(noteId, userId);

    const deleted = await tastingNoteRepository.delete(noteId);
    if (!deleted) throw new NotFoundError("errors.tastingNoteNotFound");

    // Nota bağlı beğeni, yorum ve bildirimler artık öksüz kalmamalı
    await interactionService.removeNoteInteractions(noteId);
  }
}

export const tastingNoteService = new TastingNoteService();
