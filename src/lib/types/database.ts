export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          features: Json
          max_quality: string
          max_devices: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price?: number
          features?: Json
          max_quality?: string
          max_devices?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          features?: Json
          max_quality?: string
          max_devices?: number
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          status: string
          started_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          status?: string
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          status?: string
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          description: string
          release_year: number
          duration_minutes: number
          rating: number
          poster_url: string
          backdrop_url: string
          trailer_url: string | null
          genres: string[]
          required_tier: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          release_year: number
          duration_minutes: number
          rating?: number
          poster_url: string
          backdrop_url: string
          trailer_url?: string | null
          genres?: string[]
          required_tier?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          release_year?: number
          duration_minutes?: number
          rating?: number
          poster_url?: string
          backdrop_url?: string
          trailer_url?: string | null
          genres?: string[]
          required_tier?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_watchlist: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          added_at?: string
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          progress_seconds: number
          completed: boolean
          last_watched: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          progress_seconds?: number
          completed?: boolean
          last_watched?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          progress_seconds?: number
          completed?: boolean
          last_watched?: string
        }
      }
    }
  }
}
