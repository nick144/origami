Origami Prototype
=================

This repository contains a prototype for [Origami](http://www.dtelepathy.com/labs/apps/origami). Origami is an intuitive and delightful way to reveal your content using modern HTML5 and CSS3 technologies. Origami also falls back gracefully to traditional, JavaScript based interaction for older browsers that do not support these technologies (< IE 10).

Here is what you will need to use the Origami prototype:

* jQuery v.1.7+
* a basic knowledge of HTML/CSS and JavaScript

Installation/Setup
------------------

Start by adding the CSS to the `<head>` of your page - `origami.css`

    <link type="text/css" rel="stylesheet" href="orgami.css" />

    </head>
    <body>

Then add the neccessary JavaScript files to the `<head>` of your page, after the `origami.css` and before the `</head>` tag - `jquery-1.9.1.min.js` or any jQuery 1.7+ and `origami.js` . Alternatively, you may place these files before the bottom of your `<body>` tag.

    <link type="text/css" rel="stylesheet" href="origami.css" />

    <script type="text/javascript" src="jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="origami.js"></script>

    </head>
    <body>


Structure your HTML element
---------------------------

Setup your Origami HTML:

    <div class="origami">
        <div class="kami">
            <img src="origami.png">
        </div>

        <div class="kami origami-content">
            <img src="origami.png">
            <p><strong>Origami Prototype</strong></p>
            <p>Unfold and reveal your content with an intuitive, delightful interaction and design.</p>
        </div>
    </div>

The wrapping `<div class="origami">` element will contain two `<div class="kami">` (_kami_) elements - the _closed_ and _opened_ state, respectively, of your interaction. These _kami_ elements can contain any HTML, but keep in mind, for the interaction the markup is duplicated multiple times, so don't use IDs on any elements here to keep you markup sane.

Initialize your Origami
-----------------------

Simply find your _Origami_ elements and run the `.origami()` jQuery plugin:

    $(function(){
      $('.origami').origami();
    });

Customizing Options
-------------------

You can specify options for your _Origami_ elements in two ways: a JSON formatted JavaScript object passed at initialization:

    $('.origami').origami({
      touch: true,
      speed: 500
    });

Or by setting HTML5 data attributes on your _Origami_ elements for easier deployment:

    <div class="origami" data-touch="on" data-speed="500">
      .
      .
      .
    </div>
    <script>
      $(function(){
        $('.origami').origami();
      });
    </script>

Available Options
-----------------

**method** `(string)` 

The interaction method to use - CSS animation or traditional JavaScript interaction. The _Origami_ library will automatically fallback to JavaScript interaction if the browser does not support CSS animations. Available values:
* `"animate"` - JavaScript based animation, default for older browsers (< IE 10)
* `"css"` - CSS transform and transition based interaction, default for newer browsers

**kami** `(string)` 

The CSS selector for the elements to use as the _kami_ elements for the _opened_ and _closed_ states of your _Origami_. Default is `"> .kami"`.

**speed** `(integer)` 

The speed in milliseconds to animate between states. Default is `350`

**touch** `(boolean)` 

Toggle touch support on devices that support it. Default is `false`. _Note: when specifying a boolean value using HTML5 data attributes, use "on" or "off" for the value._

----

(c) 2013 digital-telepathy, Inc. MIT License.