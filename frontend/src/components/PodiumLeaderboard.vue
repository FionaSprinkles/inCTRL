<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  podiumOnly: Boolean,
})

const activeTab = ref('Total')
const tabs = ['Today', 'Week', 'Total']
const leaderboardData = ref([])

// Split players into podium (top 3) and remaining list
const podiumPlayers = computed(() => leaderboardData.value.slice(0, 3))
const remainingPlayers = computed(() => leaderboardData.value.slice(3))

// Fetch leaderboard data from the backend based on the active time filter
const fetchLeaderboard = async () => {
  const limit = props.podiumOnly ? 3 : 50
  const res = await fetch(
    `/api/quiz/leaderboard?filter=${activeTab.value.toLowerCase()}&limit=${limit}`,
  )
  const data = await res.json()
  if (data.success) leaderboardData.value = data.leaderboard
}

// Fetch data immediately on component mount and trigger when tab changes
watch(activeTab, fetchLeaderboard)
onMounted(fetchLeaderboard)
</script>

<template>
  <div class="leaderboard-container" :class="{ bare: podiumOnly }">
    <!-- Header section with title and time filter tabs -->
    <header v-if="!podiumOnly" class="header">
      <h1 class="title">Leaderboard</h1>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </header>

    <!-- Podium card for top 3 players -->
    <div class="podium-card" :class="{ bare: podiumOnly }" v-if="podiumPlayers.length > 0">
      <div v-if="!podiumOnly" class="podium-header">
        <h2>Podium</h2>
        <p>Top 3 with the highest score</p>
      </div>

      <div class="podium-wrapper">
        <div
          v-for="player in podiumPlayers"
          :key="player.rank"
          :class="['podium-item', `rank-${player.rank}`]"
        >
          <!-- Crown for the 1st place winner -->
          <div v-if="player.rank === 1" class="crown">👑</div>

          <!-- Player avatar initial -->
          <div class="avatar">
            {{ player.initial }}
          </div>

          <!-- Player details -->
          <div class="player-info">
            <span class="player-name">{{ player.name }}</span>
            <span class="player-points">{{ player.points }}</span>
          </div>

          <!-- Podium pillar with rank number -->
          <div class="podium-pillar">
            <span class="rank-number">{{ player.rank }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Remaining list for positions 4 and below -->
    <div class="leaderboard-list-card" v-if="!podiumOnly && remainingPlayers.length > 0">
      <h3>Top 50 Players</h3>

      <div class="list-items">
        <div v-for="player in remainingPlayers" :key="player.rank" class="list-item">
          <span class="list-rank">#{{ player.rank }}</span>

          <div class="list-player-info">
            <div class="list-avatar" :style="{ backgroundColor: player.avatarBg }">
              {{ player.initial }}
            </div>
            <span class="list-name">{{ player.name }}</span>
          </div>

          <span class="list-points">{{ player.points }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main container and layout */
.leaderboard-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 16px;
  color: white;
}

/* Header section with title and time filter tabs */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title {
  font-size: 2rem;
  margin: 0 0 4px 0;
}

/* Time filter tabs */
.tabs {
  padding: 4px;
  border-radius: 30px;
  display: flex;
  gap: 4px;

  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--color-text-white);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #0d1615;
}

/* Compact podium card for top 3 players */
.podium-card {
  border-radius: 16px;
  padding: 16px 20px;

  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

.podium-header h2 {
  font-weight: 500;
  font-size: 25px;
  margin: 0 0 2px 0;
  color: var(--color-text-white);
}

.podium-header p {
  font-size: 16px;
  color: var(--color-text-main);
  margin: 0 0 16px 0;
}

/* Podium wrapper layout */
.podium-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  padding-top: 10px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 140px;
  position: relative;
  transition: transform 0.2s;
}

.podium-item:hover {
  transform: translateY(-2px);
}

.rank-1 {
  order: 2;
}
.rank-2 {
  order: 1;
}
.rank-3 {
  order: 3;
}

/* Avatar colors per place */
.rank-1 .avatar {
  background-color: #ecbd4a;
  box-shadow:
    inset 0 10px 18px rgba(255, 255, 255, 0.35),
    inset 0 -14px 22px rgba(0, 0, 0, 0.35),
    inset 8px 0 14px rgba(255, 255, 255, 0.12),
    inset -8px 0 14px rgba(0, 0, 0, 0.18),
    0 10px 24px rgba(0, 0, 0, 0.35);
}

.rank-2 .avatar {
  background-color: #d3d8e6;
  box-shadow:
    inset 0 10px 18px rgba(255, 255, 255, 0.35),
    inset 0 -14px 22px rgba(0, 0, 0, 0.35),
    inset 8px 0 14px rgba(255, 255, 255, 0.12),
    inset -8px 0 14px rgba(0, 0, 0, 0.18),
    0 10px 24px rgba(0, 0, 0, 0.35);
}

.rank-3 .avatar {
  background-color: #dc9a6b;
  box-shadow:
    inset 0 10px 18px rgba(255, 255, 255, 0.35),
    inset 0 -14px 22px rgba(0, 0, 0, 0.35),
    inset 8px 0 14px rgba(255, 255, 255, 0.12),
    inset -8px 0 14px rgba(0, 0, 0, 0.18),
    0 10px 24px rgba(0, 0, 0, 0.35);
}

.rank-1 .podium-pillar {
  height: 110px;
  background-color: #ecbd4a;
}
.rank-2 .podium-pillar {
  height: 80px;
  background-color: #d3d8e6;
}
.rank-3 .podium-pillar {
  height: 60px;
  background-color: #dc9a6b;
}

/* Winner crown */
.crown {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

/* Player avatar circle */
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
}

/* Player metadata styling */
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0;
  text-align: center;
}

.player-name {
  font-weight: bold;
  font-family: var(--font-display), serif;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.player-points {
  font-size: 0.8rem;
  margin-top: 1px;
}

/* Podium pillars with custom heights */
.podium-pillar {
  width: 100%;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-number {
  font-family: Georgia, serif;
  font-size: 1.8rem;
  font-weight: bold;
  color: #1e293b;
}

/* Top 50 remaining list card */
.leaderboard-list-card {
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;

  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

.leaderboard-list-card h3 {
  font-size: 20px;
  margin: 0 0 12px 0;
  color: var(--color-text-white);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  transition: background 0.2s;
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.list-rank {
  font-weight: bold;
  color: #a0aec0;
  width: 40px;
  font-size: 0.9rem;
}

.list-player-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.list-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
}

.list-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.list-points {
  font-weight: bold;
  color: #fff;
  font-size: 0.9rem;
}

.leaderboard-container.bare {
  background: none;
  padding: 0;
  border-radius: 0;
  max-width: none;
}

.podium-card.bare {
  background: none;
  border: none;
  padding: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  text-shadow: none;
}

.bare .player-points {
  color: #cbd5e0;
}

.bare .podium-wrapper {
  max-width: 380px;
  margin: 0 auto;
}

.bare .rank-1 .podium-pillar {
  height: 90px;
}
.bare .rank-2 .podium-pillar {
  height: 65px;
}
.bare .rank-3 .podium-pillar {
  height: 48px;
}

/* Pillars with inner shadows (home page only) */
.podium-pillar {
  border: none;
  box-shadow:
    inset 0 10px 18px rgba(255, 255, 255, 0.35),
    inset 0 -14px 22px rgba(0, 0, 0, 0.35),
    inset 8px 0 14px rgba(255, 255, 255, 0.12),
    inset -8px 0 14px rgba(0, 0, 0, 0.18),
    0 10px 24px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.3s ease;
}

.rank-number {
  color: #1e293b;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}
</style>
