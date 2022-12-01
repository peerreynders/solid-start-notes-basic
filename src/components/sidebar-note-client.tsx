import { createSignal, Show, useTransition } from 'solid-js';
import { useLocation, useNavigate } from 'solid-start';
import { extractNoteId, noteHref } from '~/route-path';

import type { JSX } from 'solid-js';

type Props = {
  id: string;
  title: string;
  summary: JSX.Element;
  recentEdit: boolean;
  children: JSX.Element;
}

export default function SidebarNoteClient(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  
  const active = () => props.id === extractNoteId(location.pathname);
  // const active = () => location.pathname.startsWith(noteHref(props.id));

  // View note detail when clicked
  const viewNoteDetail = () => navigate(noteHref(props.id)); 
  const openNote = (e: Event) => { 
    e.stopPropagation(); 
    startTransition(viewNoteDetail) 
  };

  // Expand/collapse note
  const [expanded, setExpanded] = createSignal(false);
  const invert = (x: boolean) => !x; 
  const toggleExpand = (e: Event) => {
    e.stopPropagation(); 
    setExpanded(invert);
  };

  // Flash Note if it was recently edited 
  // 
  let containerRef: HTMLDivElement | undefined = undefined;
  const removeFlash = () => containerRef?.classList.remove('sidebar-note--flash');

  // Expand (or collapse) the sidebar note summary
  // 
  const classContainer = () => 'sidebar-note' + 
    (expanded() ? ' sidebar-note--expanded' : '') +
    (props.recentEdit ? ' sidebar-note--flash' : '');

  // The active note has a distinct border and
  // background color
  // 
  // When switching to a different note view
  // all sidebar notes go to the 'pending'
  // background color while the new view is loading
  //
  const classOpen = () => `sidebar-note__open` +
    (active() ? ' sidebar-note__open--active' : '') +
    (pending() ? ' sidebar-note__open--pending' : '');
  
  return (
    <div
      ref = { containerRef }
      class={ classContainer() }
      onAnimationEnd = { removeFlash }  
    >
      { props.children }
      <button 
        class={ classOpen() }
	onClick={ openNote }
      >
        Open note for preview
      </button>
      <button 
        class="sidebar-note__expand" 
	onClick={ toggleExpand }
      >
        <Show 
	  when={ expanded() } 
	  fallback={ <img src="/chevron-up.svg" width="10px" height="10px" alt="Expand" /> } 
	>
          <img src="/chevron-down.svg" width="10px" height="10px" alt="Collapse"/>
	</Show>
      </button>
      <div class="sidebar-note__summary" >
        { props.summary }
      </div>
    </div>
  );
}
