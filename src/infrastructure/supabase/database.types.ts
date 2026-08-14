export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      activity_attempts: {
        Row: {
          activity_id: string;
          content_version: string;
          correct: boolean;
          course_id: string;
          created_at: string;
          event_id: string;
          feedback: string | null;
          generator_id: string | null;
          generator_seed: string | null;
          generator_sequence: number | null;
          generator_version: string | null;
          id: string;
          item_id: string;
          max_score: number;
          occurred_at: string;
          response: Json;
          response_time_ms: number | null;
          score: number;
          session_id: string;
          user_id: string;
          validation: string;
        };
        Insert: {
          activity_id: string;
          content_version: string;
          correct: boolean;
          course_id: string;
          created_at?: string;
          event_id: string;
          feedback?: string | null;
          generator_id?: string | null;
          generator_seed?: string | null;
          generator_sequence?: number | null;
          generator_version?: string | null;
          id?: string;
          item_id: string;
          max_score: number;
          occurred_at: string;
          response: Json;
          response_time_ms?: number | null;
          score: number;
          session_id: string;
          user_id: string;
          validation?: string;
        };
        Update: {
          activity_id?: string;
          content_version?: string;
          correct?: boolean;
          course_id?: string;
          created_at?: string;
          event_id?: string;
          feedback?: string | null;
          generator_id?: string | null;
          generator_seed?: string | null;
          generator_sequence?: number | null;
          generator_version?: string | null;
          id?: string;
          item_id?: string;
          max_score?: number;
          occurred_at?: string;
          response?: Json;
          response_time_ms?: number | null;
          score?: number;
          session_id?: string;
          user_id?: string;
          validation?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_attempts_session_fkey';
            columns: ['session_id', 'user_id', 'course_id', 'activity_id'];
            isOneToOne: false;
            referencedRelation: 'practice_sessions';
            referencedColumns: ['id', 'user_id', 'course_id', 'activity_id'];
          },
        ];
      };
      attempt_skill_evidence: {
        Row: {
          attempt_id: string;
          course_id: string;
          created_at: string;
          skill_id: string;
          user_id: string;
          weight: number;
        };
        Insert: {
          attempt_id: string;
          course_id: string;
          created_at?: string;
          skill_id: string;
          user_id: string;
          weight?: number;
        };
        Update: {
          attempt_id?: string;
          course_id?: string;
          created_at?: string;
          skill_id?: string;
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'attempt_skill_evidence_attempt_fkey';
            columns: ['attempt_id', 'user_id', 'course_id'];
            isOneToOne: false;
            referencedRelation: 'activity_attempts';
            referencedColumns: ['id', 'user_id', 'course_id'];
          },
          {
            foreignKeyName: 'attempt_skill_evidence_skill_fkey';
            columns: ['course_id', 'skill_id'];
            isOneToOne: false;
            referencedRelation: 'skills';
            referencedColumns: ['course_id', 'id'];
          },
        ];
      };
      courses: {
        Row: {
          content_version: string;
          created_at: string;
          description: string;
          id: string;
          is_published: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          description: string;
          id: string;
          is_published?: boolean;
          title: string;
          updated_at?: string;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_published?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          activity_id: string;
          completed_at: string | null;
          content_version: string;
          course_id: string;
          created_at: string;
          difficulty: string | null;
          id: string;
          mode: string;
          seed: string | null;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activity_id: string;
          completed_at?: string | null;
          content_version: string;
          course_id: string;
          created_at?: string;
          difficulty?: string | null;
          id: string;
          mode: string;
          seed?: string | null;
          started_at: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activity_id?: string;
          completed_at?: string | null;
          content_version?: string;
          course_id?: string;
          created_at?: string;
          difficulty?: string | null;
          id?: string;
          mode?: string;
          seed?: string | null;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'practice_sessions_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          locale: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          locale?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          locale?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      skill_mastery: {
        Row: {
          calculation_version: string;
          course_id: string;
          evidence_count: number;
          last_practiced_at: string | null;
          mastery_score: number;
          skill_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calculation_version: string;
          course_id: string;
          evidence_count: number;
          last_practiced_at?: string | null;
          mastery_score: number;
          skill_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calculation_version?: string;
          course_id?: string;
          evidence_count?: number;
          last_practiced_at?: string | null;
          mastery_score?: number;
          skill_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skill_mastery_skill_fkey';
            columns: ['course_id', 'skill_id'];
            isOneToOne: false;
            referencedRelation: 'skills';
            referencedColumns: ['course_id', 'id'];
          },
        ];
      };
      skills: {
        Row: {
          content_version: string;
          course_id: string;
          created_at: string;
          description: string;
          id: string;
          is_published: boolean;
          parent_skill_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content_version: string;
          course_id: string;
          created_at?: string;
          description: string;
          id: string;
          is_published?: boolean;
          parent_skill_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content_version?: string;
          course_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_published?: boolean;
          parent_skill_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skills_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'skills_parent_fkey';
            columns: ['course_id', 'parent_skill_id'];
            isOneToOne: false;
            referencedRelation: 'skills';
            referencedColumns: ['course_id', 'id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_local_attempt: {
        Args: {
          p_content_version: string;
          p_correct: boolean;
          p_event_id: string;
          p_feedback?: string;
          p_generator_id?: string;
          p_generator_seed?: string;
          p_generator_sequence?: number;
          p_generator_version?: string;
          p_item_id: string;
          p_max_score: number;
          p_occurred_at?: string;
          p_response: Json;
          p_response_time_ms?: number;
          p_score: number;
          p_session_id: string;
          p_skill_evidence: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
