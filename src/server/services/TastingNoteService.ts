/**
 * @file TastingNoteService.ts
 * @description Business rules for tasting notes. Ownership — a user may only
 * read, edit and delete their own note — is enforced in this layer.
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

  /** A non-owner does not get a NotFound: the Forbidden distinction is worth having in the logs. */
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

  /** The whisky detail page: all of the user's tasting sessions for that whisky. */
  async getNotesForWhiskey(userId: string, whiskeyId: string): Promise<TastingNoteDTO[]> {
    const notes = await tastingNoteRepository.findByUserAndWhiskey(userId, whiskeyId);
    return notes.map(toTastingNoteDTO);
  }

  /** The notes shown on a public profile (public ones only). */
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
   * The activity feed: the public notes of the people this user follows.
   * Returns an empty list when they follow nobody.
   */
  async getFeed(userId: string, pagination?: TastingNotePaginationOptions): Promise<PaginatedNotes> {
    const followingIds = await followRepository.getFollowingIds(userId);
    // Notes by people who closed their account drop out of the feed. findFeed
    // takes its author ids from outside, so filtering needs no join.
    const activeIds = await userRepository.filterActiveIds(followingIds);
    const result = await tastingNoteRepository.findFeed(activeIds, pagination);
    return {
      ...result,
      data: await this.withInteractions(result.data.map(toTastingNoteDTO), userId),
    };
  }

  /**
   * The public view of a single tasting note (the permalink page).
   * A note that is not public is visible only to its owner; anyone else gets
   * NotFound.
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

    // findById does not populate the author — it is fetched separately for the
    // card header. If the author closed their account findById returns null,
    // and the note must disappear too: otherwise a hidden profile's writing
    // would still be readable through the permalink.
    const author = await userRepository.findById(authorId);
    if (!author) throw new NotFoundError("errors.tastingNoteNotFound");
    dto.author = toPublicUserDTO(author);

    dto.interactions = await interactionService.getInteractionsForNote(noteId, viewerId);
    return dto;
  }

  /** Adds the like/comment summary to a list of notes in bulk (avoiding N+1). */
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

    // A note can only be written against a whisky that exists in the catalogue
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

    // Ownership check
    await this.getNoteForUser(noteId, userId);

    const updated = await tastingNoteRepository.update(noteId, parsed.data);
    if (!updated) throw new NotFoundError("errors.tastingNoteNotFound");
    return toTastingNoteDTO(updated);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    // Ownership check
    await this.getNoteForUser(noteId, userId);

    const deleted = await tastingNoteRepository.delete(noteId);
    if (!deleted) throw new NotFoundError("errors.tastingNoteNotFound");

    // The likes, comments and notifications hanging off the note must not be
    // left orphaned
    await interactionService.removeNoteInteractions(noteId);
  }
}

export const tastingNoteService = new TastingNoteService();
