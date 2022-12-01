import { Show } from 'solid-js'; 
import ClientSidebarNote from './sidebar-note-client';
import { formatDateOnly, formatTimeOnly, isToday } from '../lib/helpers';

import type { NoteView } from '~/types';

export type Props = {
  note: NoteView;
  recentEdit: boolean;
};

export default function SidebarNote(props: Props) {
  const lastUpdatedAt = () => {
    const updatedAt = new Date(props.note.updatedAt);
    return isToday(updatedAt) ? formatTimeOnly(updatedAt) : formatDateOnly(updatedAt);
  };

  return (
    <ClientSidebarNote
      id = { props.note.id }
      title = { props.note.title }
      summary = {
       <p class="sidebar-note__summary-content">
         <Show 
           when = { props.note.summary }
	   fallback = { <i>(No Content)</i> }
         >
           { props.note.summary }
         </Show>
       </p>
      }
      recentEdit={ props.recentEdit }
    >
      <header class="sidebar-note__header">
        <strong>{ props.note.title }</strong>
        <small>{ lastUpdatedAt() }</small>
      </header>
    </ClientSidebarNote>
  );
}
