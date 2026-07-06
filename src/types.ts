export interface Booking {
  id: string;
  user_id: string;
  user_email?: string;
  student_reg: string;
  roommate1_reg: string;
  roommate2_reg: string;
  floor: number;
  room_number: string;
  created_at: string;
}
