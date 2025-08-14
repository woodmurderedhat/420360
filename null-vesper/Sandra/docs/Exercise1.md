## **Exercise Prompt: Build a Branching, Glitchy Web Comic**

### **Objective:**

Create an interactive, browser-based comic that demonstrates advanced web design concepts. Your comic will include multiple  **branching storylines** ,  **panel variations** , and  **glitch-style effects** , all running locally without any CORS issues. This exercise emphasizes JSON-driven content, DOM manipulation, event handling, and creative CSS/JS effects.

### **Requirements:**

1. **Project Setup**
   * The project should run  **entirely in the browser** , locally.
   * No external servers should be required, and no CORS errors should occur.
   * Organize your project like this:
     <pre class="overflow-visible!" data-start="926" data-end="1128"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>/comic-project
       /img               <- </span><span>all</span><span> comic panel images
       </span><span>index</span><span>.html
       style.css
       comic.js
       comic.json         <- </span><span>JSON</span><span> data describing pages </span><span>and</span><span> panels
     </span></span></code></div></div></pre>
2. **Comic Structure**
   * Your comic should contain  **multiple pages** , each with several  **panels** .
   * Each panel should have **multiple variants** (images, captions, sound effects, or dialogue), stored in JSON.
   * Users can navigate forward ( **Next** ) or backward ( **Previous** ) through the comic panels.
3. **Branching Storylines**
   * Pressing **Previous** should:
     * Randomly select a **variant** for the current panel.
     * Randomly reselect variants for all subsequent panels  **on this page and on future pages** , creating alternate story paths.
   * Pressing **Next** moves forward along the currently chosen path.
4. **JSON Data Format**
   * Each page contains an array of panels, and each panel contains an array of variants:
     <pre class="overflow-visible!" data-start="1898" data-end="2551"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"><span class="" data-state="closed"></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-json"><span><span>{</span><span>
       </span><span>"pages"</span><span>:</span><span></span><span>[</span><span>
         </span><span>{</span><span>
           </span><span>"number"</span><span>:</span><span></span><span>1</span><span>,</span><span>
           </span><span>"panels"</span><span>:</span><span></span><span>[</span><span>
             </span><span>{</span><span>
               </span><span>"id"</span><span>:</span><span></span><span>"p1_1"</span><span>,</span><span>
               </span><span>"variants"</span><span>:</span><span></span><span>[</span><span>
                 </span><span>{</span><span>"image"</span><span>:</span><span>"p1_panel1.jpg"</span><span>,</span><span>"caption"</span><span>:</span><span>"Text for variant 1"</span><span>}</span><span>,</span><span>
                 </span><span>{</span><span>"image"</span><span>:</span><span>"p1_panel1_alt.jpg"</span><span>,</span><span>"caption"</span><span>:</span><span>"Text for variant 2"</span><span>}</span><span>
               </span><span>]</span><span>
             </span><span>}</span><span>,</span><span>
             </span><span>{</span><span>
               </span><span>"id"</span><span>:</span><span></span><span>"p1_2"</span><span>,</span><span>
               </span><span>"variants"</span><span>:</span><span>[</span><span>
                 </span><span>{</span><span>"image"</span><span>:</span><span>"p1_panel2.jpg"</span><span>,</span><span>"dialog"</span><span>:</span><span>"Dialogue variant 1"</span><span>}</span><span>,</span><span>
                 </span><span>{</span><span>"image"</span><span>:</span><span>"p1_panel2_alt.jpg"</span><span>,</span><span>"dialog"</span><span>:</span><span>"Dialogue variant 2"</span><span>}</span><span>
               </span><span>]</span><span>
             </span><span>}</span><span>
           </span><span>]</span><span>
         </span><span>}</span><span>
       </span><span>]</span><span>
     </span><span>}</span><span>
     </span></span></code></div></div></pre>
5. **Glitch Effect**
   * Panels should appear with a **glitch-style animation** (CSS or JS) when transitioning in.
   * The effect should simulate comic-style “glitching into existence.”
6. **Navigation UI**
   * Include **Next** and **Previous** buttons on the page.
   * Buttons should be styled to fit a comic aesthetic and not interfere with the panels.
7. **Rendering Logic**
   * Use **JavaScript** to dynamically render each panel variant.
   * Maintain a **story state array** to track which variant is currently displayed per panel.
   * Re-randomize subsequent panels when going backward to simulate alternate storylines.
8. **Browser-Friendly Design**
   * Use **relative paths** for images and JSON to ensure it runs locally (`file://`) without CORS errors.
   * Avoid loading resources from external servers.
9. **Optional Enhancements**
   * Add **audio effects** or “SFX” for specific panels.
   * Add visual markers for branching points, hinting that the story may change if the reader goes backward.
   * Include smooth transitions or subtle animations for all images, captions, and dialogue.

### **Learning Outcomes**

By completing this project, you will:

* Learn how to structure  **JSON-driven web content** .
* Practice **DOM manipulation and dynamic rendering** using JavaScript.
* Explore **branching logic and state management** for interactive narratives.
* Apply **CSS animations and glitch effects** creatively.
* Design a fully **local web app** that avoids CORS issues.
* Understand how **randomization and branching** can affect storytelling in interactive media.
