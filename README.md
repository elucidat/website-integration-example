# Elucidat Website Integration Example

An example demonstrating integrating Elucidat into a website (or App) via an iframe, with responsive sizing and data being passed back via window.postMessage.



### Iframes and iOS

Iframes in mobile iOS will auto-resize to fit their entire content, this becomes problematic for 2 reasons:

- It will cause issues with scrolling due to the iframe being bigger than the screen
- If the page contains elements with a px size bigger than the screen width it will cause the iframe do expand horizontally and create an horizontal scrollbar and break the page layout


To fix this we need to:
1. Add `scrolling="no"` to the iframe and the iframe size needs to be set in `px`
2. Add javascript to resize the iframe in px based on the screen size
3. Add a scrollbar in the document body inside the iframe



#### 1 - Add `scrolling="no"` to the iframe
For this to work the iframe size needs to be set in px (Step 2)

This will remove the scroll from the iframe so we need to make the body element inside the iframe scrollable (step 3)

``` html
<iframe ... scrolling="no" />
```


#### 2 - Set the iframe size, in px, using the screen's size
This needs to update the iframe when the page first loads, or when the browser resizes

``` Javascript
// calculate the iframe size when the window size changes
window.addEventListener( "resize", resizeIFrameAfterDelay() );

resizeIFrameAfterDelay = () => {
    setTimeout(function () {
        resizeIFrame();
    }, 0);
}

// set the iframe size
resizeIFrame = () => {
    const iFrame = this.iframe;
    if (iFrame) {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        iFrame.style.height = `${h}px`;
        iFrame.style.width = `${w}px`;
    }
}
```


#### 3 - Add overflow to the document body
Adding `scrolling="no"` to the iframe makes it unscrollable so to complete the fix we need to move the overflow to the body of the course, this needs to be done via a plugin

``` Javascript
$('html, body').css({
    'height':'100%',
    'overflow': 'auto'
});
```
