// Player colors for 4 players
export const PLAYER_COLORS = [
  '#00ff00', // Green - Player 1
  '#ff0000', // Red - Player 2
  '#00bfff', // Blue - Player 3
  '#ffaa00', // Orange - Player 4
] as const;

export const PLAYER_COLOR_NAMES = [
  'green',
  'red',
  'blue',
  'orange',
] as const;

export function getPlayerColor(playerIndex: number): string {
  return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
}

export function getPlayerColorName(playerIndex: number): string {
  return PLAYER_COLOR_NAMES[playerIndex % PLAYER_COLOR_NAMES.length];
}
