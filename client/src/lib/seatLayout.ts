export const SEAT_ROWS = 8;
export const SEAT_COLS = 12;
export const MAX_SELECTABLE_SEATS = 8;
export const DEFAULT_TICKET_PRICE = 14.99;
export const SEAT_HOLD_MINUTES = 15;

const SEATS_PER_ROOM = SEAT_ROWS * SEAT_COLS;

export const seatCellKeyToLabel = (seatKey: string) => {
  const [rowIndex, colIndex] = seatKey.split("-").map(Number);
  return `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
};

export const seatLabelToCellKey = (seatLabel: string) => {
  const normalizedSeatLabel = seatLabel.trim().toUpperCase();
  const rowIndex = normalizedSeatLabel.charCodeAt(0) - 65;
  const colIndex = Number(normalizedSeatLabel.slice(1)) - 1;

  if (
    Number.isNaN(rowIndex) ||
    Number.isNaN(colIndex) ||
    rowIndex < 0 ||
    rowIndex >= SEAT_ROWS ||
    colIndex < 0 ||
    colIndex >= SEAT_COLS
  ) {
    return null;
  }

  return `${rowIndex}-${colIndex}`;
};

export const seatLabelToOrdinal = (seatLabel: string) => {
  const seatKey = seatLabelToCellKey(seatLabel);

  if (!seatKey) {
    return null;
  }

  const [rowIndex, colIndex] = seatKey.split("-").map(Number);
  return rowIndex * SEAT_COLS + colIndex + 1;
};

export const ordinalToSeatLabel = (ordinal: number) => {
  if (!Number.isInteger(ordinal) || ordinal <= 0 || ordinal > SEATS_PER_ROOM) {
    return null;
  }

  const rowIndex = Math.floor((ordinal - 1) / SEAT_COLS);
  const colIndex = (ordinal - 1) % SEAT_COLS;

  return `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
};

export const seatLabelToApiSeatId = (seatLabel: string, roomId: number) => {
  const ordinal = seatLabelToOrdinal(seatLabel);

  if (!ordinal || !Number.isInteger(roomId) || roomId <= 0) {
    return null;
  }

  // Cinema-API does not expose seat layout ids, so we preserve the current 8x12
  // grid by assuming each room owns a contiguous 96-seat id block.
  return (roomId - 1) * SEATS_PER_ROOM + ordinal;
};

export const apiSeatIdToSeatLabel = (seatId: number, roomId: number) => {
  if (!Number.isInteger(seatId) || !Number.isInteger(roomId) || roomId <= 0) {
    return null;
  }

  const ordinal = seatId - (roomId - 1) * SEATS_PER_ROOM;
  return ordinalToSeatLabel(ordinal);
};

export const toApiDateString = (dateLike: string | Date) => {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatHoldCountdown = (expiresAt: string | null | undefined) => {
  if (!expiresAt) {
    return null;
  }

  const expiryTimestamp = new Date(expiresAt).getTime();

  if (Number.isNaN(expiryTimestamp)) {
    return null;
  }

  const remainingMs = expiryTimestamp - Date.now();

  if (remainingMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${`${minutes}`.padStart(2, "0")}:${`${seconds}`.padStart(2, "0")}`;
};

export const formatVndCurrency = (amount: number) => {
  if (!Number.isFinite(amount)) {
    return "0 VNĐ";
  }

  return `${Math.round(amount).toLocaleString("vi-VN")} VNĐ`;
};
