/**
 * Reward entity - represents a reward in the system
 * Based on the MongoDB schema and backend entity
 */
export interface Reward {
  /** Unique identifier */
    _id: string;

  /** Reward name (required, max 100 characters) */
  name: string;

  /** Reward description (optional, max 500 characters) */
  description?: string;

  /** Points required to redeem the reward (required, minimum 1) */
  pointsRequired: number;

  /** Whether the reward is enabled for redemption */
  enabled: boolean;

  /** Total number of times this reward has been redeemed */
  totalExchanges: number;

  /** Firebase Storage URL for the reward image */
  imageUrl?: string;

  /** Firebase Storage path for the reward image */
  imagePath?: string;

  /** Media type of the reward image */
  mediaType?: 'image' | 'video';

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Pagination metadata
 */
export interface RewardPagination {
  /** Current page number */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Total number of items */
  totalCount: number;

  /** Items per page */
  limit: number;
}

/**
 * API response wrapper for reward lists
 */
export interface RewardResponse {
  /** Indicates if the request was successful */
  success: boolean;

  /** Response data wrapper */
  data: {
    /** Indicates if the data operation was successful */
    success: boolean;

    /** Array of rewards */
    data: Reward[];

    /** Pagination metadata */
    // TODO: Review
    pagination: RewardPagination;
  };
}

/**
 * API response wrapper for single reward operations
 */
export interface RewardApiResponse {
  /** Indicates if the request was successful */
  success: boolean;

  /** Response message */
  message: string;

  /** Reward data (present for successful operations) */
  data?: Reward;
}
/**
 * Media types allowed for reward images
 */
export type RewardMediaType = 'image' | 'video';


