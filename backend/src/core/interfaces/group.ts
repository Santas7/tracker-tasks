export interface Group {
    id: number;
    name: string;
    description?: string;
    admin_user_id?: number;
    created_at: Date;
    updated_at: Date;
}
  