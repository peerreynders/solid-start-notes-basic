// file: src/components/note-edit.tsx
import NotePreview from './note-preview';

export default function NoteEdit() {
	return (
		<div class="c-note-edit">
			<form class="c-note-edit__form">
				<label class="u-offscreen" for="note-edit__title">
					Enter a title for your note
				</label>
				{/*
        <input
          id="note-title-input"
          type="text"
					value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }} 
        />
				*/}
				<input id="note-edit__title" type="text" />
				<label class="u-offscreen" for="note-edit__body">
					Enter the body for your note
				</label>
				{/*
        <textarea
          id="note-body-input"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
          }}
        />
				*/}
				<textarea id="note-edit__body" />
			</form>
			<div class="c-note-edit__preview">
				<div class="c-note-edit__menu" role="menubar">
					<button class="c-note-edit__done" role="menuitem">
						<img
							src="./checkmark.svg"
							width="14px"
							height="10px"
							alt=""
							role="presentation"
						/>
						Done
					</button>
					<button class="c-note-edit__delete" role="menuitem">
						<img
							src="./cross.svg"
							width="10px"
							height="10px"
							alt=""
							role="presentation"
						/>
						Delete
					</button>
				</div>
				<div class="c-note-edit__label-preview" role="status">
					Preview
				</div>
				<h1 class="c-note-edit__note-title">{'note title'}</h1>
				<NotePreview body={'note body'} />
			</div>
		</div>
	);
}
