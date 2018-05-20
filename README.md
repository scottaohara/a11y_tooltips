# ARIA Tooltips

A progressively enhanced ARIA tooltip component.


## Functionality  
Tooltips appear when hovering over or focusing a tooltip component. 
## Rules for a tooltip
Only one tooltip should be revealed at a time=.  For instance, there may be a situation where a user is navigating by keyboard, and with their mouse. If keyboard focus is currently set to an element that has a tooltip, and that tooltip is displayed, then if the user moves their mouse, then that tooltip should become hidden.

A user should be able to hit the escape key to close a tooltip, regardless of if that tooltip was opened by focus or hover of an element.  Mouseout or blur of that element would reset the dismissal of the tooltip, so returning to that element, or moving to another element with a tooltip would allow the target element's tooltip to be revealed.


Hover/focus should reveal the tooltip for the element it is associated with.

A true tooltip should only contain up to a sentence or two of content. If it needs to be longer than that, or contain elements that are not simply text (e.g. lists, images, etc.) then it really shouldn't be a traditional tooltip.  Instead it should be a toggle tooltip (aka a disclosure widget styled to look like a tooltip) which will allow a virtual cursor, or keyboard focus to enter the "tooltip" so that users can parse through the information at their own pace.

## Minimum Required Mark-up  
```html
...
```

### The hooks
`data-tooltip`
the wrapping element of the tooltip component
check for ID, if does not have one, generate
if value of data-tooltip="toggle" then a 
data-tooltip-trigger should be generated.
the aria-label for this trigger should be 
gathered from data-tooltip-label="..."
if this does not exist, generate "more info" as the acc name.

`data-tooltip-place-trigger`
this attribute identifies the element in which the tooltip trigger
should be placed (if generated). (if this attribute is not set
then the tooltip trigger should be placed directly before the 
.tooltip element)

`data-tooltip-trigger`
The element that triggers the reveal of a tooltip. This element should have a native or ARIA role that would be associated with receiving keyboard focus. e.g. an `img`. If used on an element that can not receive keyboard focus, then some users (screen reader users) may not be able to access the tooltip information.


`.tooltip`
The container of the tooltip content which should be given a `role='tooltip'`.


## The Events



## License & Such  
This script was written by [Scott O'Hara](https://twitter.com/scottohara).

It has an [MIT license](https://github.com/scottaohara/accessible-components/blob/master/LICENSE.md).

Do with it what you will :)
