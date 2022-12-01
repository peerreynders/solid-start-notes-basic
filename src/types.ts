export type NoteInsert = {
  title: string;
  body: string;
};

export type NoteUpdate = {
  id: string;
} & NoteInsert;

export type Note = NoteUpdate & {
  createdAt: string;
  updatedAt: string;
};

export type NoteView = Note & {
  summary: string;
};

export type LastEdit = 
   ['new']
 | ['update', string ]
 | ['delete', string ];
