import { quizQuestions } from './src/data/quizQuestions.js'
import { validateAnswer } from './src/services/quizValidator.js'

console.log(`Loaded ${quizQuestions.length} questions across formats:`)
const formats = new Set(quizQuestions.map(q => q.type))
console.log(Array.from(formats))

let passedCount = 0

// Test each question with its correct answer
for (const q of quizQuestions) {
  let answer
  switch (q.type) {
    case 'single_choice':
      answer = q.options.find(o => o.isCorrect).id
      break
    case 'multiple_choice':
      answer = q.options.filter(o => o.isCorrect).map(o => o.id)
      break
    case 'fill_blank':
      answer = q.acceptedAnswers[0]
      break
    case 'key_builder':
      answer = q.targetCombo
      break
    case 'matching':
      answer = {}
      q.pairs.forEach(p => { answer[p.id] = p.id })
      break
    case 'ordering':
      answer = q.correctOrder
      break
    case 'true_false':
      answer = q.correctAnswer
      break
    case 'live_press':
      answer = q.targetKeys
      break
    case 'odd_one_out':
      answer = q.imposterId
      break
  }

  const result = validateAnswer(q, answer)
  if (!result.isCorrect) {
    console.error(`FAIL for question ${q.id} (${q.type}):`, result)
  } else {
    passedCount++
  }
}

console.log(`Validation test: ${passedCount}/${quizQuestions.length} passed successfully!`)
