
import { PlannerSectionData, ItemType, UniversalTrackers } from './types';
import { v4 as uuidv4 } from 'uuid';

export const COLOR_PALETTE = ['sky', 'teal', 'rose', 'orange', 'violet', 'emerald'];

export const getWeekdayTemplate = (): PlannerSectionData[] => [
  {
    id: uuidv4(),
    title: "Today’s Focus",
    icon: "🎯",
    tasks: [
      { id: uuidv4(), type: ItemType.TEXT_LONG, label: "The ONE thing that makes today a win:", value: "" },
    ],
    isTimeboxed: false,
  },
  {
    id: uuidv4(),
    title: "Morning Launch",
    goal: "Wake up your body and brain.",
    icon: "🌅",
    startTime: "07:00",
    endTime: "09:30",
    color: COLOR_PALETTE[0],
    tasks: [
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Drink a full glass of water.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "System #3 (Exercise): Put on workout clothes.", checked: false },
      { id: uuidv4(), type: ItemType.TEXT_SHORT, label: "Movement (15-min walk, stretching, gym, etc.)", value: "" },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Get ready for the day (Shower, get dressed).", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Breakfast & Coffee/Tea.", checked: false },
    ],
  },
  {
    id: uuidv4(),
    title: "Work Block 1",
    goal: "Protect your focus for important tasks.",
    icon: "💻",
    startTime: "09:30",
    endTime: "13:00",
    color: COLOR_PALETTE[1],
    tasks: [
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "System #2 (9-5 Job): Write your Top 3 Job Tasks on a sticky note.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "System #1 (Data Science): Start a 25-min timer and work on your course. Do this first.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Deep Work: Start Job Task #1 from your sticky note.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Take a 5-minute break away from the screen.", checked: false },
    ],
  },
    {
    id: uuidv4(),
    title: "Recharge Block",
    goal: "Refuel and give your brain a real break.",
    icon: "🥗",
    startTime: "13:00",
    endTime: "14:00",
    color: COLOR_PALETTE[2],
    tasks: [
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Eat lunch (away from your desk).", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Do something non-work related (listen to music, walk, watch a short video).", checked: false },
    ],
  },
  {
    id: uuidv4(),
    title: "Work Block 2",
    goal: "Finish strong and handle collaborative work.",
    icon: "💻",
    startTime: "14:00",
    endTime: "17:30",
    color: COLOR_PALETTE[1],
    tasks: [
        { id: uuidv4(), type: ItemType.CHECKBOX, label: "Focused Work: Tackle Job Tasks #2 & #3.", checked: false },
        { id: uuidv4(), type: ItemType.CHECKBOX, label: "Check and respond to emails/messages.", checked: false },
        { id: uuidv4(), type: ItemType.CHECKBOX, label: "Evening Shutdown Prep: Note tomorrow's most important task. Close unnecessary tabs.", checked: false },
    ]
  },
  {
    id: uuidv4(),
    title: "Evening Shutdown",
    goal: "Transition out of work and reset for tomorrow.",
    icon: "🌙",
    startTime: "17:30",
    color: COLOR_PALETTE[3],
    tasks: [
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "10-Minute Tidy: Set a timer and declutter one small area.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Dinner.", checked: false },
      { id: uuidv4(), type: ItemType.TEXT_SHORT, label: "Free Time / Hobby (Read, watch a show, talk with family, etc.)", value: "" },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Prepare for tomorrow: Lay out clothes, pack bag.", checked: false },
      { id: uuidv4(), type: ItemType.CHECKBOX, label: "Fill out tomorrow's planner.", checked: false },
    ],
  },
];

export const getWeekendTemplate = (): PlannerSectionData[] => [
    {
        id: uuidv4(),
        title: "Weekend Intention",
        icon: "✨",
        tasks: [
          { id: uuidv4(), type: ItemType.TEXT_SHORT, label: "e.g., Relax, Socialize, Learn", value: "" },
        ],
        isTimeboxed: false,
    },
    {
        id: uuidv4(),
        title: "Morning",
        goal: "Start the day with intention, without pressure.",
        icon: "☀️",
        color: COLOR_PALETTE[0],
        tasks: [
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Wake up without an alarm (if possible!).", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "System #3 (Exercise): Enjoy a longer form of movement.", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "System #1 (Data Science): Focused study block (e.g., 60-90 minutes).", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Breakfast/Brunch.", checked: false },
        ]
    },
    {
        id: uuidv4(),
        title: "Afternoon",
        goal: "Mix productivity with pleasure. Choose one major block.",
        icon: "🌱",
        color: COLOR_PALETTE[1],
        tasks: [
            { id: uuidv4(), type: ItemType.CHECKBOX_WITH_TEXT, label: "Life Admin:", value: "Groceries, laundry, meal prep", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX_WITH_TEXT, label: "Social Time:", value: "Meet friends, call family", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX_WITH_TEXT, label: "Hobby/Project:", value: "Work on something you love", checked: false },
        ]
    },
    {
        id: uuidv4(),
        title: "Evening",
        goal: "Wind down and prepare for the week ahead.",
        icon: "🌙",
        color: COLOR_PALETTE[2],
        tasks: [
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Dinner.", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Relaxing activity (movie, reading, etc.).", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Sunday Reset: Look at the week's calendar.", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Sunday Reset: Write Monday's Top 3 tasks.", checked: false },
            { id: uuidv4(), type: ItemType.CHECKBOX, label: "Sunday Reset: Tidy up your workspace for a fresh start.", checked: false },
        ]
    }
];

export const getDefaultTrackers = (): UniversalTrackers => ({
    urges: 0,
    paydayChecked: false,
    dailyWin: "",
});
