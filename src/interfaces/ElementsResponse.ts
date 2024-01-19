import { Device, Reading, Point } from 'elementiot-client/lib/models';

export interface Data {
  battery: number;
  contact1?: number;
  contact1_state?: ContactState;
  contact2?: number;
  contact2_state?: ContactState;
  iso1: number;
  iso2: number;
  loop1: number;
  loop2: number;
  meas_timestamp: string;
  temp?: number;
  error_error_eeprom_write?: number;
}

export enum ContactState {
  Open = 'open',
  Closed = 'closed',
}

/**
 * Represents a reading with data.
 */
export interface ReadingData extends Reading {
  data: Data;
  parser_id: string;
  packet_id: string;
  measured_at: Date;
  location: null | Point;
}

/**
 * Represents a devices api response.
 */
export interface DeviceData extends Device {
  last_readings: ReadingData[];

  stats: Stats;
  updated_at: Date;
  inserted_at: Date;
  deleted_at: null;
  default_packets_view_id: null;
  default_readings_view_id: string;
  template_id: null;
  default_graph_preset_id: null | string;
  default_layers_id: null | string;
  static_location: boolean;
  icon: string;
  meta: null;
}

export interface Opts {
  app_session_key: string;
  check_fcnt: boolean;
  check_join_eui: boolean;
  class_c: boolean;
  device_address: string;
  device_eui: string;
  device_key: string;
  device_type: string;
  gw_whitelist: null;
  join_eui: string;
  lns_session_context: LnsSessionContext;
  max_adr_steps_per_change: number;
  net_id: number | null;
  network_session_key: string;
  region: Region;
  rx2_dr: null;
  rx_delay: number;
}

export enum Region {
  Eu863 = 'EU863',
}
export interface LnsSessionContext {
  a_fcnt_down: number;
  app_s_key: string;
  dev_addr: string;
  f_nwk_s_int_key: string;
  fcnt_down: null;
  fcnt_up: number;
  n_fcnt_down: number;
  nwk_s_enc_key: string;
  nwk_s_key: null;
  s_nwk_s_int_key: string;
}

export interface Stats {
  expires_at: null;
  dirty: null;
  mandate_id: string;
  last_probe_ping: null;
  last_packet_forwarder_ping: null;
  missed_up_frames: string;
  nominally_sending: boolean;
  avg_gw_count: string;
  packet_interval: PacketInterval;
  transceived_at: Date;
  avg_sf: number;
  avg_rssi: number;
  avg_snr: number;
  id: string;
}

export interface PacketInterval {
  days: number;
  microsecs: number;
  months: number;
  secs: number;
}
