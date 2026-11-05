/**
 * This component is extracted from Oscars CategoriesView. Too be used in multiple places.
 */

<template>
    <div class="quiz-grid">
        <article v-for="quiz in filteredQuizzes" :key="quiz.id" class="quiz-card">
            <div class="quiz-tags">
                <span class="badge category-badge">{{ quiz.categoryName || 'General' }}</span>
                <span class="badge diff-badge" :class="quiz.difficulty?.toLowerCase()">{{
                quiz.difficulty
                }}</span>
            </div>
            <h2 class="quiz-title">{{ quiz.title }}</h2>
            <p class="quiz-description">{{ quiz.description }}</p>

            <div class="quiz-footer">
              <div class="info">
                <span class="question-count">{{ quiz.questionCount || 0 }} questions</span>

                <span v-if="bestScores[quiz.id]" class="best-score">
                  Best: {{ bestScores[quiz.id].score }} / {{ bestScores[quiz.id].maxScore }}
                </span>
                </div>

                <button
                  type="button"
                  class="btn-start"
                  :class="{ completed: Boolean(bestScores[quiz.id]) }"
                  @click="startQuiz(quiz)"
                >
                  Start Quiz
                </button>
            </div>
        </article>
    </div>
    
</template>


// ===== SCRIPT =====//
<script setup>
defineProps({
  filteredQuizzes: {
    type: Array,
    required: true
  }, 
  bestScores: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['start-quiz'])

function startQuiz(quiz) {
  emit('start-quiz', quiz)
}
</script>



//===== STYLE =====//
<style scoped>
.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1.25rem;
}

.quiz-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.4rem;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
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

.quiz-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}


.quiz-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-display), serif;
  font-size: 0.8rem;
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.category-badge {
  background: rgba(133, 180, 190, 0.28);
  color: var(--color-text-white);
  border: 1px solid rgba(133, 180, 190, 0.45);
}

.diff-badge.beginner {
  background: rgba(16, 185, 129, 0.28);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.diff-badge.intermediate {
  background: rgba(245, 158, 11, 0.28);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
}

.diff-badge.advanced {
  background: rgba(239, 68, 68, 0.28);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.45);
}

.quiz-title {
  font-family: var(--font-heading), serif;
  font-size: 1.4rem;
  font-weight: 450;
  margin: 0 0 0.5rem;
  color: var(--color-text-white);
  letter-spacing: 0.5px;
  text-transform: none;
}

.quiz-description {
  font-family: var(--font-body), sans-serif;
  font-size: 0.95rem;
  color: var(--color-text-main);
  margin-bottom: 1.25rem;
  flex-grow: 1;
}

.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.question-count {
  font-family: var(--font-body), sans-serif;
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.btn-start {
  font-family: var(--font-display), serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.5rem 1.15rem;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  color: var(--color-text-white);
  font-weight: 600;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}

.btn-start.completed {
  background: var(--color-light-accenturate);
  color: var(--color-dark-accenturate);
  border-color: var(--color-light-accenturate);
  text-shadow: none;
}

.btn-start.completed:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.2);
  transition: all 0.3s ease;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.best-score {
  font-family: var(--font-body), sans-serif;
  font-size: 0.85rem;
  color: var(--color-light-accenturate);
  font-weight: 500;
}

</style>
