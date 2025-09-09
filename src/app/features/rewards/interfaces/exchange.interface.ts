/**
 * Exchange entity - represents a reward exchange in the system
 * Based on the MongoDB schema and backend entity
 */
export interface Exchange {
  /** Unique identifier */
  _id: string;

  /** ID of the reward that was exchanged */
  rewardId: string;

  /** Name of the reward that was exchanged */
  rewardName: string;

  /** Firebase Storage URL for the reward image */
  rewardImageUrl?: string;

  /** Firebase Storage path for the reward image */
  rewardImagePath?: string;

  /** Media type of the reward image */
  rewardMediaType?: 'image' | 'video';

  /** ID of the client who made the exchange */
  clientId: string;

  /** Name of the client who made the exchange */
  clientName: string;

  /** Email of the client who made the exchange */
  clientEmail: string;

  /** ID of the administrator who managed the exchange (optional) */
  adminId?: string;

  /** Name of the administrator who managed the exchange (optional) */
  adminName?: string;

  /** Points used for this exchange */
  pointsUsed: number;

  /** Date when the exchange was made */
  exchangeDate: Date;

  /** Status of the exchange */
  status: 'completed' | 'pending' | 'cancelled';

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}