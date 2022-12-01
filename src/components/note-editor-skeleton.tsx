export default function NoteEditorSkeleton() {
  return (
    <div class="note-editor" role="progressbar" aria-busy="true" >
      <div class="note-editor__form">
        <div class="note-editor-skeleton__title skeleton v-stack" />
        <div class="note-editor-skeleton__body skeleton v-stack" />
      </div>
      <div class="note-editor__preview">
        <div class="note-editor__menu">
	  <div class="note-editor-skeleton__done skeleton skeleton__button" />
	  <div class="note-editor-skeleton__delete skeleton skeleton__button" />
	</div>
	<div class="note__title note-editor-skeleton__note__title skeleton" />
	<div class="note-preview" >
	  <div class="note-editor-skeleton__line skeleton v-stack" />
	  <div class="note-editor-skeleton__line skeleton v-stack" />
	  <div class="note-editor-skeleton__line skeleton v-stack" />
	  <div class="note-editor-skeleton__line skeleton v-stack" />
	  <div class="note-editor-skeleton__line skeleton v-stack" />
	</div>
      </div>
    </div>
  );
}
