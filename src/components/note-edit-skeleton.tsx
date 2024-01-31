// file: src/components/note-edit-skeleton.tsx
export default function NoteEditSkeleton() {
	return (
		<div class="c-note-edit-skeleton" role="progressbar" aria-busy="true">
			<div class="c-note-edit-skeleton__form">
				<div class="c-note-edit-skeleton__title" />
				<div class="c-note-edit-skeleton__body" />
			</div>
			<div class="c-note-edit-skeleton__preview">
				<div class="c-note-edit-skeleton__menu">
					<div class="c-note-edit-skeleton__done" />
					<div class="c-note-edit-skeleton__delete" />
				</div>
				<div class="c-note-edit-skeleton__note-title" />
				<div class="c-note-edit-skeleton__note-preview">
					<div />
					<div />
					<div />
					<div />
					<div />
				</div>
			</div>
		</div>
	);
}
