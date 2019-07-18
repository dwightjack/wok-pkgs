<!-- prettier-ignore -->
**Core**

{{#each core}}
- [{{ name }}]({{ url }})
  {{#ifeq name ../currentcore }}
  {{#each children}}
  - [{{ name }}]({{ url }})
  {{/each}}
  {{/ifeq}}
{{/each}}

**Tasks**

{{#each tasks}}
- [{{ name }}]({{ url }})
  {{#ifeq name ../currenttasks }}
  {{#each children}}
  - [{{ name }}]({{ url }})
  {{/each}}
  {{/ifeq}}
{{/each}}

**Plugins**

{{#each plugins}}
- [{{ name }}]({{ url }})
  {{#ifeq name ../currentplugins }}
  {{#each children}}
  - [{{ name }}]({{ url }})
  {{/each}}
  {{/ifeq}}
{{/each}}

---

**API Reference**

{{#each apis}}
- [{{ name }}]({{ url }}api/)
  {{#ifeq name ../currentapis }}
  {{#each children}}
  - [{{ name }}]({{ url }})
  {{/each}}
  {{/ifeq}}
{{/each}}