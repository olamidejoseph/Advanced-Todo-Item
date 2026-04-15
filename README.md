What Changed from Stage 0 to Stage 1a
Edit Mode
Inline form with title, description, priority, and due date fields.
Save updates card; Cancel reverts to previous values.
Focus returns to Edit button after closing.

Status Management
Dropdown control for Pending / In Progress / Done.
Syncs with checkbox: Done = checked, uncheck reverts to Pending.
Visual styling changes per status (strikethrough for Done).

Priority Indicator
Editable priority with visual indicator (colored left border/dot) for Low, Medium, High.

Expand/Collapse
Long descriptions collapse by default with accessible toggle button.
Uses aria-expanded and aria-controls.

Dynamic Time & Overdue
Relative time updates every 45 seconds (e.g., "2d left", "3h left").
Overdue indicator appears when past due date (red accent).
Time display freezes to "Completed" when status is Done.

Accessibility
Proper labels, ARIA attributes, keyboard navigation, and aria-live for time updates.

Responsiveness
Adapts to mobile, tablet, and desktop without layout breakage.

