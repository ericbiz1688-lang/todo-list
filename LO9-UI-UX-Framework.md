# LO9 UI UX Framework for the Todo Application

## Purpose and assessment evidence

LO9 requires applying a UI/UX framework, such as design thinking or the Five Layers of UI/UX, to refine an application's experience and interaction. This document applies the Five Layers framework to the existing todo application and explains how its features support users.

The framework mapping is based on the current implementation. It does not claim that user research, usability testing, or a historical design iteration has already been completed.

## Target audience and pain point

The proposed target audience is busy students managing coursework and daily responsibilities. Their pain point is forgetting tasks and finding it difficult to identify urgent work. The application provides a central task list, urgency levels from 1 to 5, and persistent storage so saved tasks remain available after reloading.

## Applying the Five Layers of UI UX

### Strategy

The application aims to help students remember responsibilities and recognise urgency. Its success can be evaluated by asking whether a user can record a task, understand its urgency, and find it again after reloading. This audience and problem statement are design assumptions to validate with users.

### Scope

The application supports creating, viewing, editing, and deleting tasks. Each task has a name and urgency level. Validation rejects blank names and invalid urgency values. Saved tasks persist in data.json through the Node server. These features directly support maintaining a reliable task list.

### Structure

The main interaction follows a simple sequence: enter a task name, select urgency, submit the form, and review the task in the list. Selecting Edit fills the same form with existing values and changes the primary button to Save changes. Cancel edit returns the form to its initial state. Deletion requires confirmation, helping prevent accidental removal.

### Skeleton

The task form appears above the task list. Visible labels identify the name and urgency inputs. Each list row groups a task name, urgency badge, and Edit and Delete actions. The task count communicates the number of saved tasks, and the empty-state message explains what to do when no tasks exist. This arrangement supports a clear path from entering information to managing it.

### Surface

Consistent spacing and rounded panels group related content. The blue primary button emphasises submission, while red Delete text signals a consequential action. Success messages and inline errors provide feedback. Responsive CSS adjusts the layout for smaller screens, visible focus outlines support keyboard navigation, and a reduced-motion rule limits toast animation for users who request it.

## Implementation evidence

| Design decision | Evidence in the application | Intended user benefit |
|---|---|---|
| Explain urgency | index.html includes the 1 low to 5 high explanation and urgency choices | Helps users interpret the scale |
| Make editing clear | script.js fills the form and switches the button to Save changes | Makes the current action visible |
| Permit cancellation | script.js resets the form through Cancel edit | Lets users leave editing without saving |
| Confirm deletion | script.js requests confirmation before DELETE | Reduces accidental deletion |
| Provide feedback | showStatus updates error and success messages | Explains outcomes and input problems |
| Prevent duplicate submissions | setBusy disables buttons during requests | Reduces repeated actions while saving |
| Support small screens | style.css uses wrapping and a mobile media query | Keeps tasks and controls usable on narrow screens |
| Support keyboard use | style.css defines a visible focus outline | Helps users locate the focused control |

## Demonstration checklist

Run node server.js and open http://localhost:8000 before demonstrating the application.

1. Add a task and explain how the labelled form and urgency scale address the audience's pain point.
2. Show the new task and its urgency in the list, together with the updated task count and success message.
3. Select Edit and demonstrate the populated inputs and Save changes button.
4. Select Cancel edit and show that the saved task remains unchanged.
5. Select Delete, cancel the confirmation first, and then confirm deletion to demonstrate both outcomes.
6. Resize the browser to a narrow width and inspect how the task rows adapt.
7. Navigate with Tab and show the visible keyboard focus outline.
8. Reload the page to demonstrate that saved tasks remain available.

These checks are a demonstration plan; their results should be recorded after performing them.

## Refinement and validation

To strengthen evidence that the framework was used to refine the experience, record an actual improvement and evaluate it. One possible refinement is adding descriptive labels to urgency levels 2 and 4 if users find the numerical scale unclear. This proposal has not been implemented or tested.

For each refinement, record the observed difficulty, the relevant framework layer, the original interaction, the revised interaction, and the result of checking it with users. Include before-and-after screenshots where useful. Do not claim improved usability until the checks support that conclusion.

## Assessment explanation

The Five Layers framework connects the application's purpose to its features, interaction flow, layout, and visual feedback. Strategy addresses remembering and prioritising tasks. Scope defines task management and urgency. Structure organises the add, review, edit, and delete flow. Skeleton places labelled controls and actions near the information they affect. Surface provides consistent styling, responsive behaviour, and feedback. The implementation provides concrete design evidence; recorded testing and an actual refinement would strengthen the LO9 submission.
