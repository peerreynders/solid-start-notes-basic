import type { Note } from '~/types';

type Content =[title: string, body: string];

const data: Content[] = [
  [
    'Meeting Notes',
    'This is an example note. It contains **Markdown**!'
  ],
  [
    'Make a thing',
    `It's very easy to make some words **bold** and other words *italic* with
Markdown. You can even [link to SolidStart's website!](https://start.solidjs.com/).`
  ],
  [
    'A note with a very long title because sometimes you need more words',
    `You can write all kinds of [amazing](https://en.wikipedia.org/wiki/The_Amazing)
notes in this app! These notes live on the server in the \`notes-db.json\` file.
![This app is powered by SolidStart](https://assets.solidjs.com/banner?project=Start&amp;type=core)`
  ],
  ['I wrote this note today', 'It was an excellent note.'],
];

const startOfYear = (ofDate: Date): Date => 
  new Date(ofDate.getFullYear(), 0, 1);

// https://stackoverflow.com/a/9035732
const randomDateBetween = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

type NoteTemplate = ([title, body]: Content, createdAt: Date, updatedAt: Date) => Note;

function makeNotes(template: NoteTemplate): Note[] {
  const now = new Date();
  const startOfThisYear = startOfYear(now);
  const last = data.length - 1;
  const randomDate = (_note: unknown, index: number) => 
    index < last ? randomDateBetween(startOfThisYear, now) : now;
  const dates = data.map(randomDate);

  const byDateAsc = (a: Date, b: Date) => a.getTime() - b.getTime();
  dates.sort(byDateAsc);

  return data.map((content, index): Note => template(content, dates[index], now));
}

export {
  makeNotes
};
