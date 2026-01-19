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
      users: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_by?: string
          created_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
          is_active?: boolean
        }
      }
      rejections: {
        Row: {
          id: string
          user_id: string
          group_id: string
          description: string
          created_at: string
          points: number
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          description: string
          created_at?: string
          points?: number
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          description?: string
          created_at?: string
          points?: number
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Rejection = Database['public']['Tables']['rejections']['Row']

export type LeaderboardEntry = {
  user_id: string
  username: string | null
  avatar_url: string | null
  total_points: number
  rank: number
}
