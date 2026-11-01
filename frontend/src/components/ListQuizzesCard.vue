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
                <span class="question-count">{{ quiz.questionCount || 0 }} questions</span>
                <button type="button" class="btn-start" @click="startQuiz(quiz)">Start Quiz</button>
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
  background: rgba(18, 86, 98, 0.52);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.quiz-card:hover {
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);
}


.quiz-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-display);
  font-size: 0.8rem;
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.category-badge {
  background: rgba(133, 180, 190, 0.28);
  color: var(--color-text-heading);
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
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 450;
  margin: 0 0 0.5rem;
  color: var(--color-text-heading);
  letter-spacing: 0.5px;
  text-transform: none;
}

.quiz-description {
  font-family: var(--font-body);
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
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.btn-start {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  padding: 0.5rem 1.15rem;
  border-radius: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 600;
  border: 1px solid var(--color-button-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-start:hover {
  background: var(--color-button-hover);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.35);
}

</style>