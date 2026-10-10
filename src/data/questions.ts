import type { PortalId, Trait } from './portals'

export type AnswerIndex = 0 | 1 | 2
export type Question = { text: string; answers: readonly [string, string, string]; traits: readonly [Trait, Trait, Trait] }

// Approved wording: keep this copy unchanged. Traits are prototype scoring metadata.
export const questions: Record<PortalId, readonly [Question, Question, Question, Question]> = {
  performance: [
    { text: 'What excites you most about driving?', answers: ['Feeling the acceleration.', 'Taking curves with confidence.', 'Enjoying a smooth, relaxing ride.'], traits: ['power', 'handling', 'comfort'] },
    { text: 'What kind of driving experience do you prefer?', answers: ['Something exciting and energetic.', 'Something sporty but comfortable.', 'Something powerful but easy to control.'], traits: ['power', 'comfort', 'handling'] },
    { text: 'Who would you like to share your driving experiences with?', answers: ['Mostly just me.', 'My partner or a friend.', 'My friends or family.'], traits: ['compact', 'versatility', 'space'] },
    { text: 'What matters most to you?', answers: ['Quick acceleration.', 'Precise handling and control.', 'A balance of power and comfort.'], traits: ['power', 'handling', 'comfort'] },
  ],
  comfort: [
    { text: 'What would make your journeys more enjoyable?', answers: ['A quiet interior and comfortable seats.', 'Plenty of space for passengers and luggage.', 'Technology that makes driving easier.'], traits: ['comfort', 'space', 'technology'] },
    { text: 'Who usually travels with you?', answers: ['Mostly just me.', 'Me and one other person.', 'Family or friends.'], traits: ['compact', 'versatility', 'space'] },
    { text: 'Where do you drive most often?', answers: ['In the city.', 'On highways.', 'A bit of everything.'], traits: ['compact', 'comfort', 'versatility'] },
    { text: 'What kind of journeys do you usually take?', answers: ['Short everyday trips.', 'Long-distance journeys.', 'Weekend trips and holidays.'], traits: ['compact', 'comfort', 'space'] },
  ],
  everyday: [
    { text: 'What do you use your car for most?', answers: ['Mostly short trips around the city.', 'Daily commuting, including highways.', 'A mix of everyday driving and long journeys.'], traits: ['compact', 'comfort', 'versatility'] },
    { text: "What's most important in city driving?", answers: ['Easy parking.', 'Good visibility and easy manoeuvring.', 'Having enough space for everything.'], traits: ['compact', 'handling', 'space'] },
    { text: 'What kind of car fits your lifestyle?', answers: ["A compact car that's easy to use every day.", 'A versatile car for both city life and weekend trips.', 'A larger car for passengers, luggage and activities.'], traits: ['compact', 'versatility', 'space'] },
    { text: 'What would your ideal city car feel like?', answers: ['Small and easy to handle.', 'Comfortable and stylish.', 'Practical and versatile.'], traits: ['compact', 'comfort', 'versatility'] },
  ],
  emotion: [
    { text: 'What matters most to you in an electric car?', answers: ['Quiet driving and lower running costs.', 'Driving as far as possible on one charge.', 'Quick acceleration and a sporty experience.'], traits: ['efficiency', 'range', 'power'] },
    { text: 'What would make you feel confident choosing an electric car?', answers: ['Knowing I can easily recharge when needed.', 'Having clear information about battery level and remaining range.', 'Enjoying the latest technology and driving features.'], traits: ['efficiency', 'range', 'technology'] },
    { text: 'How far do you usually drive in a day?', answers: ['Less than 30 km.', 'Between 30 and 100 km.', 'More than 100 km.'], traits: ['compact', 'versatility', 'range'] },
    { text: 'What type of electric car would suit your lifestyle?', answers: ['Compact and easy to drive.', 'Spacious and comfortable.', 'Sporty and exciting.'], traits: ['compact', 'space', 'power'] },
  ],
}
