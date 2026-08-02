import { z } from 'zod';

// Formun genel durumunu (state) tutan tip
export type AddNewQuoteState = {
  success: boolean;
  errors?: {
    formErrors: string[];
    fieldErrors: {
      author?: string[];
      quote?: string[];
      category?: string[];
      [key: string]: string[] | undefined;
    };
  };
  message?: string;
  data?: {
    author: string;
    quote: string;
    category?: string;
  };
};

// Zod Doğrulama Kuralları
export const newQuoteSchema = z.object({
  author: z
    .string()
    .trim()
    .min(2, { message: 'Author name should be at least 2 characters long' })
    .max(30, { message: 'Author name should be 50 characters long maximum. Please try a shorter name.'})
    .regex(/^[^0-9]*$/, { message: 'Author name cannot contain numbers' }),
  quote: z
    .string()
    .trim()
    .min(6, { message: 'Quote should be at least 6 characters long' })
    .max(300, {
      message:
        'Quote should be 300 characters long maximum. Please try a shorter one.',}),


category: z.array(z.enum(['life', 'health', 'motivation', 'wisdom'] as const))
    .min(1, 'Please select at least one category'),
});

export type NewQuoteInput = z.infer<typeof newQuoteSchema>;

export interface Quote {
  _id: unknown;
  quote: string;
  author: string;
  category: string[];
  likeCount: number;
  likedBy: string[]; 
  isLiked?: boolean;
  createdBy: string;
  adminApproved: boolean;
  createdAt: string;
  updatedAt: string;
}