# Dynamic text manager and React component

This repo consists of the following elements which work in tandem to enable "dynamic text" within Activity Player (AP).
Currently dynamic text has the following features:

- Enabling text to be read aloud

In the future we may add the following:

- Text translations
- Integration of the existing glossary highlighting code

## System Design

### DynamicText Component (component.tsx)

This is a React component that registers itself using a class instance, passed in a DynamicTextContext context,
of the DynamicTextInterface which is implemented by both the DynamicTextManager and the DynamicTextProxy.  This allows
the component to be directly used in AP (which hosts an instance of DynamicTextManager) and each question interactive
(which uses DynamicTextProxy to send LARA API custom messages to the host).

This component listens for messages to update its state in a callback after it registers itelf and then updates its className based on
the read aloud properties passed in the callback.  It also has a click handler that selects the component via the
DynamicTextInterface interface.

### DynamicTextContext React Context (context.ts)

This is a simple context provider containing a value of an instance of the DynamicTextInterface class.  It also includes
a helper hook.  This context is used in AP to hold an instance of the DynamicTextManager and in question-interactives
to hold an instance of the DynamicTextProxy.

### DynamicTextManager Class (manager.ts)

This class implments the DynamicTextInterface and manages a map of registered DynamicText components along with tracking
the currently selected component (which may be null to denote no component is selected).  It also handles reading the
selected text aloud if the component marks the text to be read aloud.  A singleton instance of this class is created
in AP and is set as the value for the DynamicTextContext.

### DynamicTextProxy Class (proxy.ts)

This class also implements the DynamicTextInterface and proxies the method calls to the host via a Lara custom message.
A singleton instance of this class is created per question interactive and is set as the value for the DynamicTextContext
in each question interactive.  The host then listens for custom dynamic text messages via the Lara api and calls
the corresponding methods on its instance of the DynamicTextManager.

Note: the iframe-runtime in question-interactives contains an additional pure message proxy for all custom messages.
This allows for interactives like the carousel, full screen, scaffolded and side by side interactive to pass messages
from the interactives they host up to AP.

# Development

All code is in TypeScript and built using Rollup.  The build process first calls the Typescript compiler to generate
the type information and then rollup to bundle the code.  To build the code run `npm run build`,
there is no watcher script.

# Publishing

This library is published on npm as @concord-consortium/dynamic-text.  To publish a new version update the package.json
version and run `npm publish`.  A `prepublish` script is included in package.json which builds the code so no separate
build step is required.

## License

This library is Copyright 2023 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See [LICENSE](LICENSE) for the complete license text.