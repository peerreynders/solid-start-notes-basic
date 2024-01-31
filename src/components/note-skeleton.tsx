// file: src/components/note-edit-skeleton.tsx

const NoteSkeletonPreview = () => (
	<div class="c-note-skeleton-preview">
		<div />
		<div />
		<div />
		<div />
		<div />
	</div>
);

const NoteSkeletonDisplay = () => (
	<div class="c-note-skeleton-display" role="progressbar" aria-busy="true">
		<div class="c-note-skeleton-display__header">
			<div class="c-note-skeleton-title" />
			<div class="c-note-skeleton-display__done" />
		</div>
		<NoteSkeletonPreview />
	</div>
);

const NoteSkeletonEdit = () => (
	<div class="c-note-skeleton-edit" role="progressbar" aria-busy="true">
		<div class="c-note-skeleton-edit__form">
			<div class="c-note-skeleton-edit__title" />
			<div class="c-note-skeleton-edit__body" />
		</div>
		<div class="c-note-skeleton-edit__preview">
			<div class="c-note-skeleton-edit__menu">
				<div class="c-note-skeleton-edit__done" />
				<div class="c-note-skeleton-edit__delete" />
			</div>
			<div class="c-note-skeleton-title" />
			<NoteSkeletonPreview />
		</div>
	</div>
);

export { NoteSkeletonDisplay, NoteSkeletonEdit };
