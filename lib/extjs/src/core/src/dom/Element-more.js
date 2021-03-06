/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial Software License Agreement provided with the Software or, alternatively, in accordance with the terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.Element
 */

Ext.Element.addMethods((function(){
    var focusRe = /button|input|textarea|select|object/;
    return {
        /**
         * Monitors this Element for the mouse leaving. Calls the function after the specified delay only if
         * the mouse was not moved back into the Element within the delay. If the mouse <i>was</i> moved
         * back in, the function is not called.
         * @param {Number} delay The delay <b>in milliseconds</b> to wait for possible mouse re-entry before calling the handler function.
         * @param {Function} handler The function to call if the mouse remains outside of this Element for the specified time.
         * @param {Object} scope The scope (<code>this</code> reference) in which the handler function executes. Defaults to this Element.
         * @return {Object} The listeners object which was added to this element so that monitoring can be stopped. Example usage:<pre><code>
// Hide the menu if the mouse moves out for 250ms or more
this.mouseLeaveMonitor = this.menuEl.monitorMouseLeave(250, this.hideMenu, this);

...
// Remove mouseleave monitor on menu destroy
this.menuEl.un(this.mouseLeaveMonitor);
    </code></pre>
         */
        monitorMouseLeave: function(delay, handler, scope) {
            var me = this,
                timer,
                listeners = {
                    mouseleave: function(e) {
                        timer = setTimeout(Ext.Function.bind(handler, scope||me, [e]), delay);
                    },
                    mouseenter: function() {
                        clearTimeout(timer);
                    },
                    freezeEvent: true
                };

            me.on(listeners);
            return listeners;
        },

        /**
         * Stops the specified event(s) from bubbling and optionally prevents the default action
         * @param {String/String[]} eventName an event / array of events to stop from bubbling
         * @param {Boolean} preventDefault (optional) true to prevent the default action too
         * @return {Ext.Element} this
         */
        swallowEvent : function(eventName, preventDefault) {
            var me = this;
            function fn(e) {
                e.stopPropagation();
                if (preventDefault) {
                    e.preventDefault();
                }
            }

            if (Ext.isArray(eventName)) {
                Ext.each(eventName, function(e) {
                     me.on(e, fn);
                });
                return me;
            }
            me.on(eventName, fn);
            return me;
        },

        /**
         * Create an event handler on this element such that when the event fires and is handled by this element,
         * it will be relayed to another object (i.e., fired again as if it originated from that object instead).
         * @param {String} eventName The type of event to relay
         * @param {Object} object Any object that extends {@link Ext.util.Observable} that will provide the context
         * for firing the relayed event
         */
        relayEvent : function(eventName, observable) {
            this.on(eventName, function(e) {
                observable.fireEvent(eventName, e);
            });
        },

        /**
         * Removes Empty, or whitespace filled text nodes. Combines adjacent text nodes.
         * @param {Boolean} forceReclean (optional) By default the element
         * keeps track if it has been cleaned already so
         * you can call this over and over. However, if you update the element and
         * need to force a reclean, you can pass true.
         */
        clean : function(forceReclean) {
            var me  = this,
                dom = me.dom,
                n   = dom.firstChild,
                nx,
                ni  = -1;
    
            if (Ext.Element.data(dom, 'isCleaned') && forceReclean !== true) {
                return me;
            }

            while (n) {
                nx = n.nextSibling;
                if (n.nodeType == 3) {
                    // Remove empty/whitespace text nodes
                    if (!(/\S/.test(n.nodeValue))) {
                        dom.removeChild(n);
                    // Combine adjacent text nodes
                    } else if (nx && nx.nodeType == 3) {
                        n.appendData(Ext.String.trim(nx.data));
                        dom.removeChild(nx);
                        nx = n.nextSibling;
                        n.nodeIndex = ++ni;
                    }
                } else {
                    // Recursively clean
                    Ext.fly(n).clean();
                    n.nodeIndex = ++ni;
                }
                n = nx;
            }

            Ext.Element.data(dom, 'isCleaned', true);
            return me;
        },

        /**
         * Direct access to the Ext.ElementLoader {@link Ext.ElementLoader#load} method. The method takes the same object
         * parameter as {@link Ext.ElementLoader#load}
         * @return {Ext.Element} this
         */
        load : function(options) {
            this.getLoader().load(options);
            return this;
        },

        /**
        * Gets this element's {@link Ext.ElementLoader ElementLoader}
        * @return {Ext.ElementLoader} The loader
        */
        getLoader : function() {
            var dom = this.dom,
                data = Ext.Element.data,
                loader = data(dom, 'loader');
    
            if (!loader) {
                loader = Ext.create('Ext.ElementLoader', {
                    target: this
                });
                data(dom, 'loader', loader);
            }
            return loader;
        },

        /**
        * Update the innerHTML of this element, optionally searching for and processing scripts
        * @param {String} html The new HTML
        * @param {Boolean} [loadScripts=false] True to look for and process scripts
        * @param {Function} [callback] For async script loading you can be notified when the update completes
        * @return {Ext.Element} this
         */
        update : function(html, loadScripts, callback) {
            var me = this,
                id,
                dom,
                interval;

            if (!me.dom) {
                return me;
            }
            html = html || '';
            dom = me.dom;

            if (loadScripts !== true) {
                dom.innerHTML = html;
                Ext.callback(callback, me);
                return me;
            }

            id  = Ext.id();
            html += '<span id="' + id + '"></span>';

            interval = setInterval(function(){
                if (!document.getElementById(id)) {
                    return false;
                }
                clearInterval(interval);
                var DOC    = document,
                    hd     = DOC.getElementsByTagName("head")[0],
                    re     = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig,
                    srcRe  = /\ssrc=([\'\"])(.*?)\1/i,
                    typeRe = /\stype=([\'\"])(.*?)\1/i,
                    match,
                    attrs,
                    srcMatch,
                    typeMatch,
                    el,
                    s;

                while ((match = re.exec(html))) {
                    attrs = match[1];
                    srcMatch = attrs ? attrs.match(srcRe) : false;
                    if (srcMatch && srcMatch[2]) {
                       s = DOC.createElement("script");
                       s.src = srcMatch[2];
                       typeMatch = attrs.match(typeRe);
                       if (typeMatch && typeMatch[2]) {
                           s.type = typeMatch[2];
                       }
                       hd.appendChild(s);
                    } else if (match[2] && match[2].length > 0) {
                        if (window.execScript) {
                           window.execScript(match[2]);
                        } else {
                           window.eval(match[2]);
                        }
                    }
                }

                el = DOC.getElementById(id);
                if (el) {
                    Ext.removeNode(el);
                }
                Ext.callback(callback, me);
            }, 20);
            dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, '');
            return me;
        },

        // inherit docs, overridden so we can add removeAnchor
        removeAllListeners : function() {
            this.removeAnchor();
            Ext.EventManager.removeAll(this.dom);
            return this;
        },
    
        /**
         * Gets the parent node of the current element taking into account Ext.scopeResetCSS
         * @protected
         * @return {HTMLElement} The parent element
         */
        getScopeParent: function(){
            var parent = this.dom.parentNode;
            return Ext.scopeResetCSS ? parent.parentNode : parent;
        },

        /**
         * Creates a proxy element of this element
         * @param {String/Object} config The class name of the proxy element or a DomHelper config object
         * @param {String/HTMLElement} [renderTo] The element or element id to render the proxy to (defaults to document.body)
         * @param {Boolean} [matchBox=false] True to align and size the proxy to this element now.
         * @return {Ext.Element} The new proxy element
         */
        createProxy : function(config, renderTo, matchBox) {
            config = (typeof config == 'object') ? config : {tag : "div", cls: config};

            var me = this,
                proxy = renderTo ? Ext.DomHelper.append(renderTo, config, true) :
                                   Ext.DomHelper.insertBefore(me.dom, config, true);

            proxy.setVisibilityMode(Ext.Element.DISPLAY);
            proxy.hide();
            if (matchBox && me.setBox && me.getBox) { // check to make sure Element.position.js is loaded
               proxy.setBox(me.getBox());
            }
            return proxy;
        },
    
        /**
         * Checks whether this element can be focused.
         * @return {Boolean} True if the element is focusable
         */
        focusable: function(){
            var dom = this.dom,
                nodeName = dom.nodeName.toLowerCase(),
                canFocus = false,
                hasTabIndex = !isNaN(dom.tabIndex);
            
            if (!dom.disabled) {
                if (focusRe.test(nodeName)) {
                    canFocus = true;
                } else {
                    canFocus = nodeName == 'a' ? dom.href || hasTabIndex : hasTabIndex;
                }
            }
            return canFocus && this.isVisible(true);
        }    
    };
})());
Ext.Element.prototype.clearListeners = Ext.Element.prototype.removeAllListeners;

