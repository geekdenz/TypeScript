#This project is no longer maintained. 

Another project makes this pretty much redundant.

Please see https://github.com/Everlaw/nbts . It has better features like Code Completion and I'm contributing to it rather than maintaining this one.

# TypeScript

## Specification for NetBeans Support for TypeScript

A basic outline of features that are needed in order in which they are needed.

All screenshots shown below are taken from the current state of this repo.

### Phase 1: Set up the GUI infrastructure

#### (a) Extension to Project Properties dialog

<img src="images/typescript-properties.png"/>

Similar to support for SASS and LESS, here the user will
specify the folders in which TS files will be found
and the matching folders where the JS should be generated.

#### (b) Extension to Options window

<img src="images/typescript-options.png"/>

Similar to support for SASS and LESS, here the user will
define the settings related to the TSC tool that will be
used to generate the JS from the TS.

### Phase 2: Generate JavaScript from TS on Save

Use tsc --sourcemap greeter.ts

Using the settings returned from the GUI defined in Phase 1,
automatically generate JS for the currently changed TS file.

### Phase 3: TypeScript Code Structures

#### (a) Code Templates for TypeScript

to be done

#### (b) File Templates for TypeScript

to be done

#### (c) Project Templates for TypeScript

<img src="images/typescript-sample-greeter.png"/>

### Phase 4: TypeScript Editor

#### (a) New File Type for TypeScript

<img src="images/typescript-filetype.png"/>

Phase 2 above assumes there is support for the TS file extension,
i.e., TS files should be recognized and when there is a change,
the JS should be generated.

#### (b) Sytax Coloring for TypeScript

<img src="images/typescript-coloring.png"/>

A start has been made, as can be seen above. ANTLR lexer has been created,
integrated, and a start has been made to setting syntax colorings, which
can already be modified in the Options window. HTML editor will be embedded
in relevant places, e.g., between quotation marks.

The above is the start of a new editor for ECMAScript, making use of this ANTLR
definition: <a href="https://raw.githubusercontent.com/antlr/grammars-v4/master/ecmascript/ECMAScript.g4">https://raw.githubusercontent.com/antlr/grammars-v4/master/ecmascript/ECMAScript.g4</a>. 
Because of the relationship between TypeScript and ECMAScript,
an ECMAScript editor should be
able to work equally well for TypeScript.

#### (c) Code Completion for TypeScript

to be done

#### (d) Refactoring for TypeScript

to be done

### Phase 5: TypeScript Debugger

to be done

