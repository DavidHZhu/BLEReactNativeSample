export type StepCountResponse = {
  session_code: number;
  step_count: number;
  avg_acceleration: number;
};

export type SimplifiedLocation =  {
  lat: number;
  lon: number;
  timestamp: number;
}
