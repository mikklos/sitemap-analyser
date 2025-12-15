(function() {
    function E(m) {
        alert(m)
    }
    var ROOT_LABEL = 'Root';
    var syntheticEl = document.getElementById('syntheticSitemapXml');
    if (!syntheticEl && !/\.xml(\?|#|$)/i.test(location.href)) {
        E('Denna bookmarklet fungerar endast på sitemap.xml eller ett fönster med genererad sitemap.');
        return
    }

    function runWithXmlText(t) {
        var p = new DOMParser(),
            d = p.parseFromString(t, 'text/xml');
        var parseErrNodes = d.getElementsByTagName('parsererror');
        var xmlParseError = parseErrNodes && parseErrNodes.length > 0;
        var rootEl = d.documentElement || null;
        var rootTag = rootEl && rootEl.tagName ? rootEl.tagName : '';
        var rootName = rootTag ? rootTag.toLowerCase().split(':').pop() : '';
        var rootOk = rootName === 'urlset' || rootName === 'sitemapindex';
        var ns = rootEl && rootEl.namespaceURI ? rootEl.namespaceURI : '';
        var nsOk = !ns || ns.indexOf('sitemaps.org/schemas/sitemap/0.9') !== -1;
        var urlNodeCount = d.getElementsByTagName('url').length;
        var sitemapNodeCount = d.getElementsByTagName('sitemap').length;
        var mixedType = urlNodeCount > 0 && sitemapNodeCount > 0;
        var allLastmods = [].slice.call(d.getElementsByTagName('lastmod'));
        var invalidLastmodCount = 0;
        for (var lmI = 0; lmI < allLastmods.length; lmI++) {
            var lmTx = (allLastmods[lmI].textContent || '').trim();
            if (!lmTx) continue;
            var lmDt = new Date(lmTx);
            if (isNaN(lmDt.getTime())) invalidLastmodCount++
        }
        var missingLocUrl = 0,
            missingLocSitemap = 0;
        var urlNodesArr = [].slice.call(d.getElementsByTagName('url'));
        for (var ui = 0; ui < urlNodesArr.length; ui++) {
            if (!urlNodesArr[ui].getElementsByTagName('loc').length) missingLocUrl++
        }
        var smNodesArr = [].slice.call(d.getElementsByTagName('sitemap'));
        for (var si = 0; si < smNodesArr.length; si++) {
            if (!smNodesArr[si].getElementsByTagName('loc').length) missingLocSitemap++
        }
        var locNodes = [].slice.call(d.getElementsByTagName('loc'));
        if (!locNodes.length) {
            E('Hittade inga <loc>-taggar i sitemap.xml');
            return
        }

        function escIdx(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        }

        function fmtISO(s) {
            if (!s) return '';
            var dt = new Date(s);
            if (isNaN(dt.getTime())) return String(s).trim();
            return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2)
        }
        if (rootName === 'sitemapindex') {
            var idxEntries = locNodes.map(function(n) {
                var u = (n.textContent || '').trim();
                if (!u) return null;
                var lmEl = n.parentNode && n.parentNode.getElementsByTagName('lastmod')[0];
                var lmTxt = lmEl && lmEl.textContent ? lmEl.textContent.trim() : '';
                return {
                    url: u,
                    lastmod: fmtISO(lmTxt),
                    count: null
                }
            }).filter(function(x) {
                return !!x
            });
            var htmlIndex = '<!doctype html><html><head><meta charset="utf-8"><title>Sitemap-index</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#111827;color:#e5e7eb;margin:0}#top{position:sticky;top:0;background:#020617;border-bottom:1px solid #1f2937;z-index:3}#topInner{max-width:1100px;margin:0 auto;padding:10px 16px;display:flex;justify-content:flex-end;gap:8px}button{padding:6px 12px;border-radius:999px;border:1px solid #4b5563;background:#1f2937;color:#e5e7eb;font-size:13px;cursor:pointer}button:hover{background:#111827;border-color:#9ca3af}button:disabled{opacity:.55;cursor:not-allowed}#wrap{max-width:1100px;margin:0 auto;padding:18px 16px 24px}h1{font-size:20px;margin:4px 0 14px}h2{font-size:15px;margin:0 0 8px}p{margin:6px 0 10px;font-size:13px;line-height:1.55}.box{background:#0b1220;border-radius:14px;border:1px solid #1f2937;padding:14px 14px 12px;margin-bottom:14px}.lead{font-size:13px;line-height:1.55;color:#e5e7eb}.note{font-size:12px;color:#9ca3af;margin-top:8px}#idxSearchSitemaps{width:100%;margin:10px 0 10px;padding:9px 12px;border-radius:999px;border:1px solid #374151;background:#020617;color:#e5e7eb;font-size:13px;outline:none}#idxSearchSitemaps:focus{border-color:#60a5fa;box-shadow:0 0 0 1px #0f172a,0 0 0 4px rgba(56,189,248,0.35)}#idxList{list-style:none;margin:0;padding:0;max-height:360px;overflow:auto;border-radius:10px;border:1px solid #1f2937;background:#020617}#idxList li{padding:9px 10px;border-bottom:1px solid #0b1220;font-size:13px;display:flex;align-items:flex-start;gap:10px}#idxList li:last-child{border-bottom:none}a{color:#93c5fd;text-decoration:none}a:hover{text-decoration:underline}.idxDate{font-size:11px;color:#9ca3af;white-space:nowrap;margin-left:auto}.idxCount{font-size:11px;color:#a9c3ff;white-space:nowrap;margin-left:8px}.pill{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid #334155;background:#0f172a;color:#e5e7eb}#idxSummary{font-size:13px;margin:4px 0 10px;color:#e5e7eb}#idxSearch{width:100%;margin:0 0 10px;padding:9px 12px;border-radius:999px;border:1px solid #374151;background:#020617;color:#e5e7eb;font-size:13px;outline:none}#idxSearch:focus{border-color:#60a5fa;box-shadow:0 0 0 1px #0f172a,0 0 0 4px rgba(56,189,248,0.35)}table{width:100%;border-collapse:separate;border-spacing:0}thead th{position:sticky;top:0;background:#0b1220;color:#cbd5e1;font-size:11px;text-transform:uppercase;letter-spacing:.06em;text-align:left;padding:10px;border-bottom:1px solid #1f2937}tbody td{padding:10px;border-bottom:1px solid #0b1220;vertical-align:top;font-size:13px}tbody tr:hover td{background:#0a162d}.colUrl{width:68%}.colSm{width:22%}.colDt{width:10%;white-space:nowrap;color:#9ca3af;font-size:12px}#syntheticSitemapXml{display:none}#loadWrap{display:flex;justify-content:center;margin-top:12px}#idxLoadAllBtn{padding:10px 18px;border-radius:999px;border:1px solid #60a5fa;background:linear-gradient(180deg,#2563eb,#1d4ed8);color:#eaf2ff;font-weight:700;font-size:13px;box-shadow:0 10px 22px rgba(0,0,0,.35),0 0 0 4px rgba(56,189,248,.15)}#idxLoadAllBtn:hover{filter:brightness(1.06);border-color:#93c5fd}#idxLoadAllBtn:disabled{background:#1f2937;border-color:#334155;box-shadow:none;color:#9ca3af}</style></head><body><div id="top"><div id="topInner"><button id="closeBtn" type="button">Stäng</button></div></div><div id="wrap"><h1>Sitemap-index</h1><div class="box"><h2>Det här är ett sitemapindex</h2><p class="lead">Listan under visar underliggande sitemap-filer. Antal URL laddas in automatiskt. Knappen under listan bygger en samlad URL-lista och skapar samtidigt en dold XML-sitemap i fönstret, så att du kan köra bookmarkleten här igen.</p><div class="note">Tips: Om indexet är stort kan laddning ta tid. Fönstret uppdaterar tabeller löpande.</div></div><div class="box"><h2>Sitemaps i indexet <span class="pill" id="idxCountPill">räknar…</span></h2><input id="idxSearchSitemaps" placeholder="Sök bland sitemap:er (URL, namn, datum, antal)"><ul id="idxList"></ul><div id="loadWrap"><button id="idxLoadAllBtn" type="button">Ladda alla sitemap:er (' + idxEntries.length + ')</button></div></div><div id="idxResult" class="box" style="display:none;"><h2>Samlad URL-lista</h2><div id="idxSummary"></div><input id="idxSearch" placeholder="Filtrera på URL, sitemap eller datum"><div style="max-height:520px;overflow:auto;border-radius:10px;border:1px solid #1f2937;background:#020617"><table><thead><tr><th class="colUrl">URL</th><th class="colSm">Sitemap</th><th class="colDt">Datum</th></tr></thead><tbody id="idxTbody"></tbody></table></div><textarea id="syntheticSitemapXml"></textarea><div class="note">Den dolda XML:en ligger i <span class="pill">#syntheticSitemapXml</span> i det här fönstret.</div></div></div></body></html>';
            var wIndex = open('', '_blank');
            if (!wIndex) {
                E('Kunde inte öppna nytt fönster/flik');
                return
            }
            wIndex.document.write(htmlIndex);
            wIndex.document.close();
            var docI = wIndex.document;

            function gI(id) {
                return docI.getElementById(id)
            }
            var closeI = gI('closeBtn');
            if (closeI) {
                closeI.onclick = function() {
                    wIndex.close()
                }
            }
            var ulList = gI('idxList'),
                pill = gI('idxCountPill'),
                searchSitemaps = gI('idxSearchSitemaps');

            function shortSm(u) {
                try {
                    var up = new URL(u);
                    var parts = up.pathname.split('/').filter(Boolean);
                    return parts.length ? parts[parts.length - 1] : u
                } catch (e) {
                    var p = u.split('/');
                    return p[p.length - 1] || u
                }
            }

            function renderIdxList() {
                if (!ulList) return;
                ulList.innerHTML = '';
                var q = searchSitemaps ? (searchSitemaps.value || '').toLowerCase() : '';
                var shown = 0;
                for (var i = 0; i < idxEntries.length; i++) {
                    var ent = idxEntries[i];
                    var hay = (ent.url + ' ' + (ent.lastmod || '') + ' ' + (ent.count == null ? '' : String(ent.count)) + ' ' + shortSm(ent.url)).toLowerCase();
                    if (q && hay.indexOf(q) === -1) continue;
                    shown++;
                    var li = docI.createElement('li');
                    var a = docI.createElement('a');
                    a.href = ent.url;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.textContent = ent.url;
                    li.appendChild(a);
                    var dt = docI.createElement('span');
                    dt.className = 'idxDate';
                    dt.textContent = ent.lastmod || '';
                    li.appendChild(dt);
                    var ct = docI.createElement('span');
                    ct.className = 'idxCount';
                    ct.textContent = ent.count == null ? '…' : (ent.count + ' URL');
                    li.appendChild(ct);
                    ulList.appendChild(li)
                }
                var done = idxEntries.filter(function(x) {
                    return x.count != null
                }).length;
                if (pill) pill.textContent = done + '/' + idxEntries.length + (q ? (' • visar ' + shown) : '')
            }
            renderIdxList();
            if (searchSitemaps) {
                searchSitemaps.oninput = renderIdxList
            }(function() {
                for (var i = 0; i < idxEntries.length; i++) {
                    (function(i) {
                        var ent = idxEntries[i];
                        fetch(ent.url).then(function(r) {
                            return r.text()
                        }).then(function(txt) {
                            var sp = new DOMParser();
                            var sd = sp.parseFromString(txt, 'text/xml');
                            var urlNodes = sd.getElementsByTagName('url');
                            var locs = sd.getElementsByTagName('loc');
                            ent.count = urlNodes.length || locs.length || 0;
                            renderIdxList()
                        }).catch(function() {
                            ent.count = 0;
                            renderIdxList()
                        })
                    })(i)
                }
            })();
            var loadBtn = gI('idxLoadAllBtn'),
                resBox = gI('idxResult'),
                tbody = gI('idxTbody'),
                summaryEl = gI('idxSummary'),
                searchEl = gI('idxSearch'),
                taXml = gI('syntheticSitemapXml');
            var allRows = [],
                mergedEntries = [];

            function renderTable() {
                if (!tbody) return;
                tbody.innerHTML = '';
                var q = searchEl ? (searchEl.value || '').toLowerCase() : '';
                var shown = 0;
                for (var i = 0; i < allRows.length; i++) {
                    var r = allRows[i];
                    var hay = (r.url + ' ' + r.sitemapLabel + ' ' + (r.date || '')).toLowerCase();
                    if (q && hay.indexOf(q) === -1) continue;
                    shown++;
                    var tr = docI.createElement('tr');
                    var td1 = docI.createElement('td');
                    td1.className = 'colUrl';
                    var a = docI.createElement('a');
                    a.href = r.url;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.textContent = r.url;
                    td1.appendChild(a);
                    tr.appendChild(td1);
                    var td2 = docI.createElement('td');
                    td2.className = 'colSm';
                    td2.textContent = r.sitemapLabel || '';
                    tr.appendChild(td2);
                    var td3 = docI.createElement('td');
                    td3.className = 'colDt';
                    td3.textContent = r.date || '';
                    tr.appendChild(td3);
                    tbody.appendChild(tr)
                }
                if (summaryEl) summaryEl.textContent = 'Visar ' + shown + ' URL:er av totalt ' + allRows.length + ' (från ' + idxEntries.length + ' sitemap:er).'
            }

            function buildSyntheticXml() {
                var xml = '<?xml version="1.0" encoding="UTF-8"?>' + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
                for (var i = 0; i < mergedEntries.length; i++) {
                    var e = mergedEntries[i];
                    xml += '<url><loc>' + escIdx(e.loc) + '</loc>';
                    if (e.lastmod) xml += '<lastmod>' + escIdx(e.lastmod) + '</lastmod>';
                    xml += '</url>'
                }
                xml += '</urlset>';
                if (taXml) taXml.value = xml
            }
            if (searchEl) searchEl.oninput = renderTable;
            if (loadBtn) {
                loadBtn.onclick = function() {
                    if (!idxEntries.length) {
                        alert('Inga sitemap:er att ladda.');
                        return
                    }
                    loadBtn.disabled = true;
                    var orig = loadBtn.textContent;
                    var idx = 0;
                    resBox.style.display = 'block';
                    allRows = [];
                    mergedEntries = [];

                    function next() {
                        if (idx >= idxEntries.length) {
                            buildSyntheticXml();
                            loadBtn.disabled = false;
                            loadBtn.textContent = orig;
                            renderTable();
                            return
                        }
                        loadBtn.textContent = 'Hämtar sitemap ' + (idx + 1) + ' / ' + idxEntries.length;
                        var ent = idxEntries[idx++];
                        var su = ent.url;
                        var smLast = ent.lastmod || '';
                        var smLabel = shortSm(su);
                        fetch(su).then(function(r) {
                            return r.text()
                        }).then(function(txt) {
                            var sp = new DOMParser();
                            var sd = sp.parseFromString(txt, 'text/xml');
                            var urlNodes = sd.getElementsByTagName('url');
                            if (urlNodes.length) {
                                for (var j = 0; j < urlNodes.length; j++) {
                                    var uNode = urlNodes[j];
                                    var locEl = uNode.getElementsByTagName('loc')[0];
                                    if (!locEl || !locEl.textContent) continue;
                                    var uu = locEl.textContent.trim();
                                    if (!uu) continue;
                                    var lmEl = uNode.getElementsByTagName('lastmod')[0];
                                    var lmTxt = lmEl && lmEl.textContent ? lmEl.textContent.trim() : '';
                                    var lmVal = fmtISO(lmTxt);
                                    var date = lmVal || smLast || '';
                                    allRows.push({
                                        url: uu,
                                        sitemap: su,
                                        sitemapLabel: smLabel,
                                        date: date
                                    });
                                    mergedEntries.push({
                                        loc: uu,
                                        lastmod: lmVal || ''
                                    })
                                }
                            } else {
                                var lcs = [].slice.call(sd.getElementsByTagName('loc'));
                                for (var k = 0; k < lcs.length; k++) {
                                    var uu2 = (lcs[k].textContent || '').trim();
                                    if (!uu2) continue;
                                    var date2 = smLast || '';
                                    allRows.push({
                                        url: uu2,
                                        sitemap: su,
                                        sitemapLabel: smLabel,
                                        date: date2
                                    });
                                    mergedEntries.push({
                                        loc: uu2,
                                        lastmod: ''
                                    })
                                }
                            }
                            renderTable();
                            next()
                        }).catch(function() {
                            next()
                        })
                    }
                    next()
                }
            }
            return
        }

        function safeDecode(s) {
            try {
                return decodeURIComponent(s)
            } catch (e) {
                return s
            }
        }

        function segs(u) {
            try {
                var up = new URL(u);
                var parts = up.pathname.split('/').filter(Boolean);
                for (var i = 0; i < parts.length; i++) {
                    parts[i] = safeDecode(parts[i])
                }
                return parts
            } catch (e) {
                var a = u.split('/');
                a = a.slice(3).filter(Boolean);
                for (var j = 0; j < a.length; j++) {
                    a[j] = safeDecode(a[j])
                }
                return a
            }
        }

        function isRootURL(u) {
            var s = segs(u);
            return s.length <= 1
        }

        function firstFolder(u) {
            var s = segs(u);
            return s.length >= 1 ? s[0] : ''
        }

        function secondFolder(u) {
            var s = segs(u);
            return s.length >= 2 ? s[1] : ''
        }

        function escQ(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        }

        function fmt(d) {
            if (!d || isNaN(d.getTime())) return '–';
            var y = d.getFullYear(),
                m = ('0' + (d.getMonth() + 1)).slice(-2),
                dd = ('0' + d.getDate()).slice(-2);
            return y + '-' + m + '-' + dd
        }

        function parseLastmod(node) {
            try {
                var lmEl = node.parentNode && node.parentNode.getElementsByTagName('lastmod')[0];
                if (!lmEl || !lmEl.textContent) return null;
                var dt = new Date(lmEl.textContent.trim());
                return isNaN(dt.getTime()) ? null : dt
            } catch (_) {
                return null
            }
        }

        function hasParams(u) {
            try {
                return new URL(u).search.length > 0
            } catch (e) {
                return /\?/.test(u)
            }
        }

        function stripQH(u) {
            return u.split('#')[0].split('?')[0].toLowerCase()
        }

        function isImg(u) {
            var s = stripQH(u);
            return /\.(avif|bmp|gif|heic|jpeg|jpg|png|svg|tif|tiff|webp)$/.test(s)
        }

        function isPdf(u) {
            return /\.pdf$/.test(stripQH(u))
        }

        function isValidHttp(u) {
            try {
                var uu = new URL(u);
                return /^https?:$/i.test(uu.protocol)
            } catch (e) {
                return false
            }
        }

        function langGuess(seg) {
            return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(seg)
        }
        var entries = locNodes.map(function(n) {
            return {
                url: (n.textContent || '').trim(),
                lastmod: parseLastmod(n)
            }
        }).filter(function(e) {
            return !!e.url
        });
        var urls = entries.map(function(e) {
            return e.url
        }),
            TOTAL = urls.length;
        var dupMap = {},
            duplicateUrlCount = 0;
        for (var di = 0; di < entries.length; di++) {
            var du = (entries[di].url || '').trim();
            var dk = du.toLowerCase();
            if (!dk) continue;
            if (dupMap[dk]) {
                duplicateUrlCount++
            } else {
                dupMap[dk] = 1
            }
        }
        var siteFavicon = '';
        try {
            siteFavicon = new URL('/favicon.ico', location.href).href
        } catch (e) {
            siteFavicon = ''
        }
        var stopWords = {
            och: 1,
            vill: 1,
            inte: 1,
            att: 1,
            det: 1,
            som: 1,
            pa: 1,
            for: 1,
            med: 1,
            en: 1,
            ett: 1,
            i: 1,
            av: 1,
            till: 1,
            fran: 1,
            ar: 1,
            var: 1,
            har: 1,
            hade: 1,
            men: 1,
            om: 1,
            eller: 1,
            an: 1,
            ocksa: 1,
            bara: 1,
            utan: 1,
            nagot: 1,
            nagon: 1,
            nagra: 1,
            man: 1,
            du: 1,
            ni: 1,
            vi: 1,
            de: 1,
            dom: 1,
            han: 1,
            hon: 1,
            den: 1,
            detta: 1,
            dessa: 1,
            dar: 1,
            sa: 1,
            ju: 1,
            kan: 1,
            ska: 1,
            skall: 1,
            kommer: 1,
            blir: 1,
            blev: 1,
            mycket: 1,
            manga: 1,
            fler: 1,
            flest: 1,
            fa: 1,
            farre: 1,
            ingen: 1,
            inget: 1,
            inga: 1,
            under: 1,
            over: 1,
            after: 1,
            innan: 1,
            mot: 1,
            via: 1,
            per: 1,
            the: 1,
            of: 1,
            and: 1,
            or: 1,
            for: 1,
            to: 1,
            in: 1,
            on: 1,
            at: 1,
            by: 1,
            from: 1,
            with: 1,
            is: 1,
            are: 1,
            a: 1,
            an: 1,
            as: 1,
            this: 1,
            that: 1,
            these: 1,
            those: 1,
            be: 1,
            was: 1,
            were: 1,
            about: 1,
            into: 1,
            within: 1,
            without: 1,
            between: 1,
            index: 1,
            page: 1,
            pages: 1,
            sida: 1,
            sidor: 1,
            category: 1,
            categories: 1,
            tag: 1,
            tags: 1,
            blog: 1,
            news: 1,
            artikel: 1,
            artiklar: 1,
            produkt: 1,
            produkter: 1,
            products: 1,
            product: 1,
            html: 1
        };
        try {
            if (urls.length) {
                var _u0 = new URL(urls[0]);
                var host = _u0.hostname.toLowerCase();
                if (host.indexOf('www.') === 0) host = host.slice(4);
                var mainPart = host.split('.')[0];
                var domTokens = mainPart.split(/[^0-9a-zåäö]+/i).filter(function(x) {
                    return x && /[0-9a-zåäö]/i.test(x)
                });
                for (var di2 = 0; di2 < domTokens.length; di2++) {
                    stopWords[domTokens[di2]] = 1
                }
            }
        } catch (e) {}

        function isStop(w) {
            return Object.prototype.hasOwnProperty.call(stopWords, w)
        }

        function mapTopSlug(obj) {
            var arr = [];
            for (var k in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, k)) {
                    arr.push({
                        key: k,
                        count: obj[k]
                    })
                }
            }
            arr.sort(function(a, b) {
                if (b.count !== a.count) return b.count - a.count;
                return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
            });
            return arr
        }

        function renderListForSlug(items, emptyMsg) {
            if (!items || !items.length) return '<span style="color:#aaa;">' + escQ(emptyMsg) + '</span>';
            var s = '';
            for (var i = 0; i < items.length; i++) {
                var label = items[i].key;
                var slugVal = label.replace(/\s+/g, '-');
                s += '<button class="slugWord" type="button" data-slug="' + escQ(slugVal) + '">' + escQ(label) + ' <span class="slugCount">(' + items[i].count + ')</span></button>'
            }
            return s
        }
        var rootCount = 0,
            rootOld = null,
            rootNew = null,
            folderCounts = {},
            subCounts = {},
            folderOld = {},
            folderNew = {},
            subOld = {},
            subNew = {},
            missingLastmod = 0,
            globalOld = null,
            globalNew = null,
            depthCounts = {},
            maxDepth = 0,
            paramCount = 0,
            invalidCount = 0,
            imgCount = 0,
            pdfCount = 0,
            langMap = {},
            validDates = [],
            yearCounts = {};
        for (var i = 0; i < entries.length; i++) {
            var u = entries[i].url,
                dt = entries[i].lastmod;
            if (hasParams(u)) paramCount++;
            if (!isValidHttp(u)) invalidCount++;
            if (isImg(u)) imgCount++;
            if (isPdf(u)) pdfCount++;
            var depth = segs(u).length;
            depthCounts[depth] = (depthCounts[depth] || 0) + 1;
            if (depth > maxDepth) maxDepth = depth;
            if (dt) {
                validDates.push(dt.getTime());
                var y = dt.getFullYear();
                yearCounts[y] = (yearCounts[y] || 0) + 1;
                if (!globalOld || dt < globalOld) globalOld = dt;
                if (!globalNew || dt > globalNew) globalNew = dt
            } else {
                missingLastmod++
            }
            if (isRootURL(u)) {
                rootCount++;
                if (dt) {
                    if (!rootOld || dt < rootOld) rootOld = dt;
                    if (!rootNew || dt > rootNew) rootNew = dt
                }
            } else {
                var l1 = firstFolder(u);
                if (l1) {
                    if (langGuess(l1)) {
                        var lg = l1.toLowerCase();
                        langMap[lg] = (langMap[lg] || 0) + 1
                    }
                    folderCounts[l1] = (folderCounts[l1] || 0) + 1;
                    if (dt) {
                        if (!folderOld[l1] || dt < folderOld[l1]) folderOld[l1] = dt;
                        if (!folderNew[l1] || dt > folderNew[l1]) folderNew[l1] = dt
                    }
                    var l2 = secondFolder(u);
                    if (l2) {
                        if (!subCounts[l1]) subCounts[l1] = {};
                        subCounts[l1][l2] = (subCounts[l1][l2] || 0) + 1;
                        if (dt) {
                            if (!subOld[l1]) subOld[l1] = {};
                            if (!subNew[l1]) subNew[l1] = {};
                            if (!subOld[l1][l2] || dt < subOld[l1][l2]) subOld[l1][l2] = dt;
                            if (!subNew[l1][l2] || dt > subNew[l1][l2]) subNew[l1][l2] = dt
                        }
                    }
                }
            }
        }

        function pct(n, d) {
            return d ? Math.round(n / d * 1000) / 10 : 0
        }

        function daysBetween(ts) {
            return Math.floor((Date.now() - ts) / 86400000)
        }
        var n30 = 0,
            n90 = 0,
            n365 = 0,
            old3Count = 0;
        if (validDates.length) {
            validDates.sort(function(a, b) {
                return a - b
            });
            var L = validDates.length;
            for (var ai = 0; ai < L; ai++) {
                var age = daysBetween(validDates[ai]);
                if (age <= 30) n30++;
                if (age <= 90) n90++;
                if (age <= 365) n365++;
                if (age > 1095) old3Count++
            }
        }
        var folderStats = {};
        for (var ri = 0; ri < entries.length; ri++) {
            var ru = entries[ri].url,
                rdt = entries[ri].lastmod;
            var rdepth = segs(ru).length;
            var rl1 = isRootURL(ru) ? '' : firstFolder(ru);
            if (!rl1) continue;
            if (!folderStats[rl1]) folderStats[rl1] = {
                total: 0,
                old: 0,
                deep: 0,
                noLastmod: 0
            };
            var st = folderStats[rl1];
            st.total++;
            if (!rdt) {
                st.noLastmod++
            } else {
                var rage = daysBetween(rdt.getTime());
                if (rage > 1095) st.old++
            }
            if (rdepth >= 3) st.deep++
        }

        function isTimeBasedFolder(name) {
            var n = name.toLowerCase();
            var arr = ['nyheter', 'news', 'blogg', 'blog', 'press', 'arkiv', 'updates', 'notiser', 'artiklar', 'aktuellt'];
            for (var i2 = 0; i2 < arr.length; i2++) {
                if (n === arr[i2]) return true
            }
            return false
        }
        var riskFolders = [],
            fNames = Object.keys(folderStats);
        for (var rf = 0; rf < fNames.length; rf++) {
            var fn = fNames[rf],
                fs = folderStats[fn];
            if (!fs || !fs.total || fs.total < 5) continue;
            var oldShare = fs.old / fs.total,
                deepShare = fs.deep / fs.total,
                noLmShare = fs.noLastmod / fs.total;
            if (isTimeBasedFolder(fn)) {
                if (oldShare > 0.95 && fs.total > 30) riskFolders.push(fn)
            } else {
                if ((oldShare > 0.5 && deepShare > 0.5) || noLmShare > 0.5) riskFolders.push(fn)
            }
        }
        var folders = Object.keys(folderCounts).sort(function(a, b) {
            return folderCounts[b] - folderCounts[a]
        }),
            thinFolders = folders.filter(function(f) {
                return folderCounts[f] === 1
            }),
            thinChipsHtml = thinFolders.length ? thinFolders.map(function(fn) {
                return '<button class="thinChip" type="button" data-l1="' + escQ(fn) + '">' + escQ(fn) + '</button>'
            }).join(' ') : '';
        var rows = '';
        if (rootCount > 0) {
            var rpct = Math.round((rootCount / TOTAL) * 1000) / 10;
            rows += '<div class="row" data-root="1"><div class="leftcell"><span class="caret"></span><span class="lbl">' + escQ(ROOT_LABEL) + '</span></div><div class="meta"><strong>' + rootCount + '</strong> <span style="color:#9ca3af;font-size:11px;">(' + rpct + '%)</span></div><div class="dates">' + fmt(rootOld) + ' — ' + fmt(rootNew) + '</div><div class="bar"><i style="width:' + rpct + '%"></i></div></div>'
        }
        for (var i3 = 0; i3 < folders.length; i3++) {
            var c = folders[i3],
                cnt = folderCounts[c],
                pctC = Math.round((cnt / TOTAL) * 1000) / 10,
                hasSubs = subCounts[c] && Object.keys(subCounts[c]).length > 0;
            rows += '<div class="row" data-l1="' + escQ(c) + '"><div class="leftcell"><span class="caret"></span><span class="lbl">' + escQ(c) + '</span></div><div class="meta"><strong>' + cnt + '</strong> <span style="color:#9ca3af;font-size:11px;">(' + pctC + '%)</span></div><div class="dates">' + fmt(folderOld[c]) + ' — ' + fmt(folderNew[c]) + '</div><div class="bar"><i style="width:' + pctC + '%"></i></div></div>';
            if (hasSubs) {
                var subs = Object.keys(subCounts[c]).sort(function(a, b) {
                    return subCounts[c][b] - subCounts[c][a]
                });
                for (var j = 0; j < subs.length; j++) {
                    var s = subs[j],
                        sc = subCounts[c][s],
                        sp = Math.round((sc / TOTAL) * 1000) / 10;
                    rows += '<div class="row subrow" data-parent="' + escQ(c) + '" data-sub="' + escQ(s) + '" style="display:none;"><div class="leftcell"><span class="caret"></span><span class="lbl">' + escQ(s) + '</span></div><div class="meta"><strong>' + sc + '</strong> <span style="color:#9ca3af;font-size:11px;">(' + sp + '%)</span></div><div class="dates">' + fmt(subOld[c] && subOld[c][s]) + ' — ' + fmt(subNew[c] && subNew[c][s]) + '</div><div class="bar"><i style="width:' + sp + '%"></i></div></div>'
                }
            }
        }
        var items = '';
        for (var k2 = 0; k2 < entries.length; k2++) {
            var eu = entries[k2],
                uu = eu.url,
                dtLi = eu.lastmod;
            var rootAttr = isRootURL(uu) ? '1' : '0',
                l1 = isRootURL(uu) ? '' : firstFolder(uu),
                l2 = secondFolder(uu),
                depthK = segs(uu).length,
                lmStr = fmt(dtLi || null),
                ageStr = '',
                ageDaysVal = '';
            var hasLast = dtLi ? '1' : '0',
                hasP = hasParams(uu) ? '1' : '0',
                isInv = isValidHttp(uu) ? '0' : '1',
                isImgFlag = isImg(uu) ? '1' : '0',
                isPdfFlag = isPdf(uu) ? '1' : '0',
                yearStr = dtLi ? String(dtLi.getFullYear()) : '';
            if (dtLi) {
                var ageDays = daysBetween(dtLi.getTime());
                if (ageDays > 1095) {
                    ageStr = ' <span class="urlOldTag">3+ år</span>'
                }
                ageDaysVal = '' + ageDays
            }
            items += '<li data-idx="' + k2 + '" data-root="' + rootAttr + '" data-l1="' + escQ(l1) + '" data-l2="' + escQ(l2) + '" data-depth="' + depthK + '" data-age="' + ageDaysVal + '" data-haslast="' + hasLast + '" data-param="' + hasP + '" data-invalid="' + isInv + '" data-img="' + isImgFlag + '" data-pdf="' + isPdfFlag + '" data-year="' + escQ(yearStr) + '"><a href="' + escQ(uu) + '" target="_blank" rel="noopener">' + escQ(uu) + '</a>' + (lmStr !== '–' ? ' <span class="urlDate">' + lmStr + ageStr + '</span>' : '') + '</li>'
        }
        var missingShare = TOTAL ? (missingLastmod / TOTAL * 100) : 0;
        var noPct = missingShare ? Math.round(missingShare * 10) / 10 : 0,
            depthKeys = Object.keys(depthCounts).map(function(x) {
                return +x
            }).sort(function(a, b) {
                return a - b
            }),
            depthLis = depthKeys.map(function(dv) {
                var cnt = depthCounts[dv],
                    pp = Math.round((cnt / TOTAL) * 1000) / 10,
                    cls = dv <= 3 ? 'green' : 'orange';
                return '<li><button class="depthBtn ' + cls + '" data-depth="' + dv + '">Nivå ' + dv + '</button><span class="depthMeta">' + cnt + ' (' + pp + '%)</span></li>'
            }).join(''),
            langs = Object.keys(langMap).sort(),
            langLine = langs.length ? '<div class="kvRow"><span class="statLabel">Språk i sitemap (nivå 1)</span><span class="statValue">' + langs.length + ' <span style="color:#a9c3ff">[' + langs.join(', ') + ']</span></span></div>' : '',
            yearKeys = Object.keys(yearCounts),
            yearsHtml = '';
        if (yearKeys.length) {
            yearKeys.sort(function(a, b) {
                return b - a
            });
            yearsHtml = '<div class="yearFilter"><div class="statLabel">Årtal</div><div class="yearChips">' + yearKeys.map(function(yy) {
                return '<button class="yearChip" type="button" data-year="' + escQ(yy) + '">' + escQ(yy) + ' <span class="yearChipCount">(' + yearCounts[yy] + ')</span></button>'
            }).join(' ') + '</div></div>'
        }
        var topCats = folders.slice(0, 5),
            chipsHtml = topCats.length ? topCats.map(function(c) {
                return '<button class="catChip" type="button" data-l1="' + escQ(c) + '">' + escQ(c) + '</button>'
            }).join('') : '<span style="color:#9ca3af;font-size:12px;">Inga mappar att visa.</span>';
        var riskBlock = '';
        if (riskFolders.length) {
            riskBlock = '<div class="timeRisk"><div class="statLabel">Mög-kontroll</div><div class="statValue">' + riskFolders.length + '</div><div class="timeList">' + riskFolders.map(function(fn) {
                return '<button class="riskChip" type="button" data-l1="' + escQ(fn) + '">' + escQ(fn) + '</button>'
            }).join(' ') + '</div><div class="timeNote">Mappar som innehåller många äldre sidor långt ner i strukturen kan få lägre prioritet av Google.</div></div>'
        }
        var depthClass = 'statValue';
        if (maxDepth > 3 && maxDepth <= 8) {
            depthClass += ' warn'
        } else if (maxDepth > 8) {
            depthClass += ' bad'
        }
        var missClass = 'statValue';
        if (missingLastmod > 0 && missingShare > 0 && missingShare <= 5) {
            missClass += ' warn'
        } else if (missingShare > 5) {
            missClass += ' bad'
        }
        var paramClass = 'statValue';
        if (paramCount > 0) {
            paramClass += ' warn'
        }
        var invalidClass = 'statValue';
        if (invalidCount > 0) {
            invalidClass += ' error'
        }
        var imgClass = 'statValue';
        if (imgCount > 0) {
            imgClass += ' warn'
        }
        var pdfClass = 'statValue';
        if (pdfCount > 0) {
            pdfClass += ' warn'
        }
        var thinClass = 'statValue';
        if (thinFolders.length > 0) {
            thinClass += ' warn'
        }
        var parseStatusClass = 'statValue';
        var parseStatusText = 'OK';
        if (xmlParseError) {
            parseStatusClass += ' error';
            parseStatusText = 'XML-fel'
        }
        var rootTypeClass = 'statValue';
        var rootTypeText = rootName ? rootName : 'okänd';
        if (!rootOk) {
            rootTypeClass += ' bad'
        }
        var nsClass = 'statValue';
        var nsText = ns ? (nsOk ? 'Standard' : 'Avvikande') : 'Saknas';
        if (!nsOk) {
            nsClass += ' warn'
        }
        var invalidLmClass = 'statValue';
        var invalidLmText = invalidLastmodCount + '<small> st</small>';
        if (invalidLastmodCount > 0) {
            invalidLmClass += ' warn'
        }
        var missingLocClass = 'statValue';
        var missingTotal = missingLocUrl + missingLocSitemap;
        var missingLocText = missingTotal + '<small> st</small>';
        if (missingTotal > 0) {
            missingLocClass += ' warn'
        }
        var dupClass = 'statValue';
        var dupText = duplicateUrlCount + '<small> st</small>';
        if (duplicateUrlCount > 0) {
            dupClass += ' warn'
        }
        var missInner = missingLastmod + '<small>(' + (noPct) + '%)</small>';
        var missHtml = missingLastmod > 0 ? '<button class="' + missClass + ' statClick" data-kind="missingLastmod">' + missInner + '</button>' : '<span class="' + missClass + '">' + missInner + '</span>';
        var paramInner = '' + paramCount;
        var paramHtml = paramCount > 0 ? '<button class="' + paramClass + ' statClick" data-kind="params">' + paramInner + '</button>' : '<span class="' + paramClass + '">' + paramInner + '</span>';
        var invalidInner = '' + invalidCount;
        var invalidHtml = invalidCount > 0 ? '<button class="' + invalidClass + ' statClick" data-kind="invalid">' + invalidInner + '</button>' : '<span class="' + invalidClass + '">' + invalidInner + '</span>';
        var imgInner = '' + imgCount;
        var imgHtml = imgCount > 0 ? '<button class="' + imgClass + ' statClick" data-kind="img">' + imgInner + '</button>' : '<span class="' + imgClass + '">' + imgInner + '</span>';
        var pdfInner = '' + pdfCount;
        var pdfHtml = pdfCount > 0 ? '<button class="' + pdfClass + ' statClick" data-kind="pdf">' + pdfInner + '</button>' : '<span class="' + pdfClass + '">' + pdfInner + '</span>';
        
        // NY HTML-STRÄNG MED KRYSSRUTA I TOPPEN och UPPDATERAD CSS
        var html = '<!doctype html><html><head><meta charset="utf-8"><title>Sitemap-vy</title><link rel="icon" href="' + siteFavicon + '"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#1f1f1f;color:#fff;margin:0}#top{position:sticky;top:0;background:#111827;border-bottom:1px solid #2c2c2c;z-index:3}#topInner{max-width:1280px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:10px;justify-content:center}#k{width:min(1100px,80vw);padding:12px 16px;border-radius:999px;border:1px solid #4b5563;background:#020617;color:#fff;font-size:16px;outline:none;box-shadow:0 0 0 1px #020617,0 0 0 3px rgba(148,163,184,0.35)}#k:focus{box-shadow:0 0 0 1px #0f172a,0 0 0 5px rgba(56,189,248,0.35);border-color:#60a5fa;background:#020617}button{padding:6px 10px;background:#3b3b3b;color:#fff;border:none;border-radius:6px;cursor:pointer}button:hover{background:#575757}#wrap{max-width:1280px;margin:0 auto;padding:20px}h1{font-size:18px;margin:6px 0 14px;color:#ddd;display:flex;align-items:center;gap:6px}#siteIco{width:18px;height:18px;border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,0.45);background:#020617}#grid{display:grid;grid-template-columns:minmax(220px,300px) 1fr;gap:24px;align-items:start}#stats{grid-column:1 / -1}#stats .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:10px}#stats .card{background:#20252f;border:1px solid #2b364a;border-radius:10px;padding:12px;color:#cfe0ff}#stats .card h3{margin:0 0 8px;font-size:13px;color:#eaf2ff}#stats .kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 16px;font-size:13px;line-height:1.35}#stats .kvRow{display:flex;flex-direction:column}.statLabel{font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin-bottom:1px}.statValue{font-size:15px;font-weight:600;color:#e5e7eb}.statValue small{font-size:11px;font-weight:400;color:#9ca3af;margin-left:4px}.statValue.warn{color:#facc15}.statValue.bad{color:#f97316}.statValue.error{color:#ef4444}.statClick{background:none;border:none;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-align:left}.statClick:hover{text-decoration:underline}.slugStrip{margin-top:4px;padding-top:6px;border-top:1px solid #1f2937;font-size:12px}.slugChipRow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:3px}.slugChipLabel{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-right:4px}.slugWord{background:#111827;border:1px solid #374151;color:#eaf2ff;cursor:pointer;padding:2px 7px;border-radius:999px;font:inherit;text-decoration:none;display:inline-block}.slugWord:hover{background:#1f2937;border-color:#60a5fa}.slugCount{font-size:10px;color:#a9c3ff;margin-left:3px}.timeRange{display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap}.timeBox{flex:1 1 0;min-width:120px;padding:8px;border-radius:8px;background:#1b2332;border:1px solid #2b364a}.timeFresh{display:flex;flex-direction:column;gap:6px;margin-top:4px;font-size:12px}.timeRow{display:flex;align-items:center;gap:8px;justify-content:space-between;cursor:pointer}.timeRow span{color:#d1d5db}.timeRow:hover span{color:#e5e7eb}.miniBar{flex:1 1 auto;display:flex;align-items:center;gap:6px}.miniBarTrack{position:relative;flex:1 1 auto;height:8px;border-radius:999px;background:#111827;overflow:hidden}.miniBarTrack i{display:block;height:100%;background:#58c49a}.miniBarVal{font-size:11px;color:#9ca3af;white-space:nowrap}.timeRisk{display:flex;flex-direction:column;gap:4px;margin:10px 0 0;font-size:12px}.timeNote{color:#9ca3af;font-size:11px}.timeList{display:flex;flex-wrap:wrap;gap:4px;font-size:11px;color:#d1d5db;margin-top:2px}.riskChip{padding:2px 7px;font-size:11px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#e5e7eb;cursor:pointer}.riskChip:hover{background:#1f2937;border-color:#9ca3af}.yearFilter{margin-top:8px;display:flex;flex-direction:column;gap:4px}.yearChips{display:flex;flex-wrap:wrap;gap:6px}.yearChip{padding:4px 8px;font-size:11px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#e5e7eb;cursor:pointer}.yearChip:hover{background:#1f2937;border-color:#9ca3af}.yearChipCount{font-size:10px;color:#9ca3af;margin-left:2px}#depthList{list-style:none;padding:0;margin:6px 0 0;display:flex;gap:10px;flex-wrap:wrap}#depthList li{display:flex;align-items:center;gap:6px}.depthBtn{padding:6px 10px;border-radius:6px;border:1px solid transparent;transition:background .15s ease,border-color .15s ease,color .15s ease}.depthBtn.green{background:#2f5a46;border-color:#58c49a;color:#eafff7}.depthBtn.green:hover{background:#3a6e57}.depthBtn.orange{background:#6e5324;border-color:#d6ad5c;color:#fff6e7}.depthBtn.orange:hover{background:#876733}.depthMeta{color:#a9c3ff}.thinChip{padding:2px 7px;font-size:11px;border-radius:999px;background:#111827;border:1px solid #4b5563;color:#e5e7eb;cursor:pointer;margin-left:4px}.thinChip:hover{background:#1f2937;border-color:#9ca3af}#cats{background:#232323;border:1px solid #2e2e2e;border-radius:12px;padding:14px}#cats .catsHead{margin-bottom:8px}#cats .catsTitle{font-weight:600;font-size:13px;margin-bottom:2px}#cats .catsSub{font-size:12px;color:#9ca3af;max-width:520px}#catChips{margin:6px 0 8px;display:flex;flex-wrap:wrap;gap:6px}.catChip{padding:4px 9px;font-size:12px;border-radius:999px;background:#1f2933;border:1px solid #374151;color:#e5e7eb;cursor:pointer}.catChip:hover{background:#111827;border-color:#4b5563}#catRows{margin-top:6px}#catRows .row{padding:8px 10px;margin:6px 0;cursor:pointer;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto auto;align-items:center;gap:4px;border-radius:10px;border:1px solid #4b5563;background:radial-gradient(circle at top left,#111827,#020617);box-shadow:0 4px 10px rgba(0,0,0,0.45);transition:background .15s ease,border-color .15s ease,transform .05s ease,box-shadow .1s ease}#catRows .row:hover{background:radial-gradient(circle at top left,#1f2937,#020617);border-color:#60a5fa;transform:translateY(-1px);box-shadow:0 6px 16px rgba(15,23,42,0.8)}#catRows .rowActive{background:radial-gradient(circle at top left,#1e293b,#020617);border-color:#93c5fd;box-shadow:0 0 0 1px #60a5fa,0 6px 16px rgba(15,23,42,0.9)}#catRows .leftcell{grid-column:1;grid-row:1;display:flex;align-items:center;gap:6px}#catRows .lbl{font-weight:600}#catRows .row:hover .lbl,#catRows .rowActive .lbl{color:#e5f2ff}#catRows .row.subrow .lbl{font-weight:400}#catRows .meta{grid-column:2;grid-row:1;color:#e5e7eb;text-align:right;white-space:nowrap;font-size:13px}#catRows .dates{grid-column:1 / -1;grid-row:2;color:#a9cff;font-size:12px;opacity:.95}#catRows .bar{grid-column:1 / -1;grid-row:3;height:8px;background:#333;border-radius:999px;overflow:hidden;margin-top:2px}#catRows .bar>i{display:block;height:100%;background:#58c49a}#catRows .subrow{margin-left:15px;background:rgba(255,255,255,0.03);border-left:3px solid #4b5563}#catRows .caret{display:inline-flex;width:14px;justify-content:center;align-items:center;font-size:11px;color:#9ca3af}#catRows .caret::before{content:\"›\";font-weight:bold}#list{background:#232323;border:1px solid #2e2e2e;border-radius:12px;padding:14px;min-height:200px}#listHeader{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px}#listActions{display:flex;gap:6px;align-items:center}#listActions button{padding:4px 8px;font-size:11px;border-radius:999px}#sortControls{display:flex;gap:4px;margin-right:4px}#count{margin:0;color:#bbb;font-weight:600;font-size:13px}ul{list-style:square;padding-left:18px;margin:10px 0 0}li{margin:7px 0;line-height:1.28}a{color:#fff;text-decoration:none;border:0}a:hover{text-decoration:none;border:0}#l{list-style:none;padding-left:0;margin:10px 0 0}#l li{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin:11px 0;line-height:1.32}#l li::before{content:\"■\";font-size:7px;color:#6b7280;margin-top:4px;flex:0 0 auto}#l li a{flex:1 1 auto;min-width:0}.urlDate{flex:0 0 auto;font-size:11px;color:#9ca3af;white-space:nowrap;margin-left:6px}.urlOldTag{color:#f97316;font-weight:600;margin-left:4px}.urlStatus{font-size:11px;margin-left:6px;padding:2px 6px;border-radius:999px;border:1px solid #4b5563;color:#e5e7eb;background:#111827}.urlStatus.ok{border-color:#22c55e;color:#bbf7d0;background:#14532d}.urlStatus.notfound{border-color:#ef4444;color:#fee2e2;background:#7f1d1d}.urlStatus.redirect{border-color:#eab308;color:#fef9c3;background:#713f12}.urlStatus.other{border-color:#6b7280;color:#e5e7eb;background:#111827}.urlStatus.err{border-color:#ef4444;color:#fee2e2;background:#7f1d1d}.hint{color:#9a9a9a;font-size:12px;margin:8px 0 0}.filterActive{box-shadow: 0 0 0 2px #60a5fa, 0 0 0 4px rgba(56,189,248,0.35) !important; background: #0b1220 !important; border-color: #60a5fa !important; color: #eaf2ff !important;}</style></head><body><div id=\"top\"><div id=\"topInner\"><button id=\"closeBtn\">Stäng</button><button id=\"resetBtn\">Rensa</button><input id=\"k\" placeholder=\"Sök (blanksteg = OCH)\"><label style=\"display:flex;align-items:center;gap:4px;font-size:12px;color:#9ca3af;\"><input type=\"checkbox\" id=\"multiFilterToggle\">Kombinera filter</label><button id=\"reportBtn\" type=\"button\">Rapport</button></div></div><div id=\"wrap\"><h1><img id=\"siteIco\" src=\"' + siteFavicon + '\" alt=\"\"> Sitemap!</h1><div id=\"grid\"><div id=\"stats\"><div class=\"cards\"><div class=\"card\"><h3>Översikt</h3><div class=\"kv\"><div class=\"kvRow\"><span class=\"statLabel\">Totalt antal URL</span><span class=\"statValue\">' + TOTAL + '<small>st</small></span></div><div class=\"kvRow\"><span class=\"statLabel\">Mappar (nivå 1)</span><span class=\"statValue\">' + folders.length + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Sajtens djup</span><span class=\"' + depthClass + '\">' + maxDepth + '<small>nivåer</small></span></div><div class=\"kvRow\"><span class=\"statLabel\">Saknar &lt;lastmod&gt;</span>' + missHtml + '</div><div class=\"kvRow\"><span class=\"statLabel\">URL med parametrar</span>' + paramHtml + '</div><div class=\"kvRow\"><span class=\"statLabel\">Ofullständiga URL</span>' + invalidHtml + '</div><div class=\"kvRow\"><span class=\"statLabel\">Bilder i sitemap</span>' + imgHtml + '</div><div class=\"kvRow\"><span class=\"statLabel\">PDF i sitemap</span>' + pdfHtml + '</div><div class=\"kvRow\"><span class=\"statLabel\">Tunna mappar (1 URL)</span><span class=\"' + thinClass + '\">' + thinFolders.length + '<small> st</small>' + (thinChipsHtml ? ' ' + thinChipsHtml : '') + '</span></div>' + langLine + '</div></div><div class=\"card\"><h3>Aktualitet</h3><div class=\"timeRange\"><div class=\"timeBox\"><div class=\"statLabel\">Äldsta URL</div><div class=\"statValue\">' + fmt(globalOld || null) + '</div></div><div class=\"timeBox\"><div class=\"statLabel\">Nyaste URL</div><div class=\"statValue\">' + fmt(globalNew || null) + '</div></div></div><div class=\"timeFresh\"><div class=\"timeRow\" data-range=\"30\"><span>Senaste 30 d</span><div class=\"miniBar\"><div class=\"miniBarTrack\"><i style=\"width:' + pct(n30, validDates.length) + '%\"></i></div><div class=\"miniBarVal\">' + n30 + ' (' + pct(n30, validDates.length) + '%)</div></div></div><div class=\"timeRow\" data-range=\"90\"><span>Senaste 90 d</span><div class=\"miniBar\"><div class=\"miniBarTrack\"><i style=\"width:' + pct(n90, validDates.length) + '%\"></i></div><div class=\"miniBarVal\">' + n90 + ' (' + pct(n90, validDates.length) + '%)</div></div></div><div class=\"timeRow\" data-range=\"365\"><span>Senaste 365 d</span><div class=\"miniBar\"><div class=\"miniBarTrack\"><i style=\"width:' + pct(n365, validDates.length) + '%\"></i></div><div class=\"miniBarVal\">' + n365 + ' (' + pct(n365, validDates.length) + '%)</div></div></div><div class=\"timeRow\" data-range=\"old3\"><span>Äldre än 3 år</span><div class=\"miniBar\"><div class=\"miniBarTrack\"><i style=\"width:' + pct(old3Count, validDates.length) + '%\"></i></div><div class=\"miniBarVal\">' + old3Count + ' (' + pct(old3Count, validDates.length) + '%)</div></div></div></div>' + riskBlock + yearsHtml + '</div><div class=\"card\"><h3>Validator</h3><div class=\"kv\"><div class=\"kvRow\"><span class=\"statLabel\">XML-status</span><span class=\"' + parseStatusClass + '\">' + parseStatusText + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Rot-element</span><span class=\"' + rootTypeClass + '\">' + escQ(rootTypeText) + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Namespace</span><span class=\"' + nsClass + '\">' + nsText + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Blandade url/sitemap</span><span class=\"statValue' + (mixedType ? ' warn' : '') + '\">' + (mixedType ? 'Ja' : 'Nej') + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Ogiltiga &lt;lastmod&gt;</span><span class=\"' + invalidLmClass + '\">' + invalidLmText + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Noder utan &lt;loc&gt;</span><span class=\"' + missingLocClass + '\">' + missingLocText + '</span></div><div class=\"kvRow\"><span class=\"statLabel\">Dubbletter av URL</span><span class=\"' + dupClass + '\">' + dupText + '</span></div></div></div></div><div class=\"slugStrip\"><div class=\"statLabel\">Slug-analys</div><div class=\"slugChipRow\"><span class=\"slugChipLabel\">Enord</span><span id=\"slugWords\"></span></div><div class=\"slugChipRow\"><span class=\"slugChipLabel\" id=\"slugBigLabel\">Tvåord</span><span id=\"slugBigrams\"></span></div></div><div class=\"card\" style=\"background:#20252f;border:1px solid #2b364a;border-radius:10px;padding:12px;color:#cfe0ff;margin-top:10px;\"><h3>Djupfördelning</h3><ul id=\"depthList\">' + depthLis + '</ul></div></div><div id=\"cats\"><div class=\"catsHead\"><div class=\"catsTitle\">Struktur &amp; kategorier</div><div class=\"catsSub\">Klicka på kort, chip eller nivå för att filtrera URL-listan.</div></div><div id=\"catChips\">' + chipsHtml + '</div><div id=\"catRows\" style=\"margin-top:6px\">' + rows + '</div><div class=\"hint\">Hela kortet är klickbart. Underkategorier är indragna med markerad vänsterkant.</div></div><div id=\"list\"><div id=\"listHeader\"><div id=\"count\">0 / ' + TOTAL + ' URL:er visas</div><div id=\"listActions\"><div id=\"sortControls\"><button id=\"sortDefaultBtn\" type=\"button\">Standard</button><button id=\"sortDateBtn\" type=\"button\">Datum</button><button id=\"sortNameBtn\" type=\"button\">Namn</button></div><button id=\"copyBtn\" type=\"button\">Kopiera</button><button id=\"downloadBtn\" type=\"button\">Ladda ner (CSV)</button><button id=\"statusBtn\" type=\"button\">Statuskoll</button></div></div><ul id=\"l\">' + items + '</ul></div></div></div></body></html>';
        var w = open('', '_blank');
        if (!w) {
            E('Kunde inte öppna nytt fönster/flik');
            return
        }
        w.document.write(html);
        w.document.close();
        var doc = w.document;

        // GLOBALA FILTER STATES
        var activeFilters = {
            search: '',
            category: '', // L1
            sub: '',      // L2
            root: false,
            depth: null,
            range: null,  // Tidsålder
            year: null,   // Årtal
            stat: null    // T.ex. 'missingLastmod', 'params'
        };
        var multiFilterMode = false;


        function $(id) {
            return doc.getElementById(id)
        }

        // --- CENTRAL FILTRERINGSLOGIK ---
        function applyFilters() {
            var lis = [].slice.call($('l').children);
            var qWords = activeFilters.search ? activeFilters.search.toLowerCase().split(/\s+/).filter(Boolean) : [];

            for (var i = 0; i < lis.length; i++) {
                var li = lis[i];
                var isMatch = true;
                
                // 1. Sökfilter (Måste matcha ALLA sökord)
                if (qWords.length) {
                    var txt = li.innerText.toLowerCase();
                    for (var wIdx = 0; wIdx < qWords.length; wIdx++) {
                        if (txt.indexOf(qWords[wIdx]) === -1) {
                            isMatch = false;
                            break;
                        }
                    }
                }

                // 2. Kategorifilter (L1/L2/Root)
                if (isMatch) {
                    if (activeFilters.root) {
                        if (li.getAttribute('data-root') !== '1') isMatch = false;
                    } else if (activeFilters.category) {
                        if (li.getAttribute('data-l1') !== activeFilters.category) isMatch = false;
                        
                        if (isMatch && activeFilters.sub) {
                            if (li.getAttribute('data-l2') !== activeFilters.sub) isMatch = false;
                        }
                    }
                }
                
                // 3. Djupfilter
                if (isMatch && activeFilters.depth !== null) {
                    if (parseInt(li.getAttribute('data-depth') || '0', 10) !== activeFilters.depth) isMatch = false;
                }

                // 4. Åldersintervall (Range/TimeFresh)
                if (isMatch && activeFilters.range) {
                    var aStr = li.getAttribute('data-age');
                    var age = aStr ? parseInt(aStr, 10) : NaN;
                    var r = activeFilters.range;

                    if (isNaN(age)) {
                         isMatch = false;
                    } else if (r === '30') {
                        if (age > 30) isMatch = false;
                    } else if (r === '90') {
                        if (age > 90) isMatch = false;
                    } else if (r === '365') {
                        if (age > 365) isMatch = false;
                    } else if (r === 'old3') {
                        if (age <= 1095) isMatch = false;
                    }
                }
                
                // 5. Årtalsfilter
                if (isMatch && activeFilters.year) {
                    if (li.getAttribute('data-year') !== String(activeFilters.year)) isMatch = false;
                }

                // 6. Statistik/Metafilter (missingLastmod, params, invalid, img, pdf)
                if (isMatch && activeFilters.stat) {
                     var attr = '';
                     var valToCheck = '';
                     switch (activeFilters.stat) {
                        case 'missingLastmod': attr = 'data-haslast'; valToCheck = '0'; break;
                        case 'params': attr = 'data-param'; valToCheck = '1'; break;
                        case 'invalid': attr = 'data-invalid'; valToCheck = '1'; break;
                        case 'img': attr = 'data-img'; valToCheck = '1'; break;
                        case 'pdf': attr = 'data-pdf'; valToCheck = '1'; break;
                     }
                     if (attr) {
                         var val = li.getAttribute(attr) || '0';
                         if (val !== valToCheck) isMatch = false;
                     }
                }
                
                li.style.display = isMatch ? '' : 'none';
            }

            clearActiveRows(); // Uppdatera visuell markering
            refresh(); // Uppdatera räknare och slug-analys
        }

        // Funktion för att helt rensa alla filter utom search
        function clearAllNonSearchFilters() {
             activeFilters.category = '';
             activeFilters.sub = '';
             activeFilters.root = false;
             activeFilters.depth = null;
             activeFilters.range = null;
             activeFilters.year = null;
             activeFilters.stat = null;
             // Lämna activeFilters.search intakt
        }

        // SLUT CENTRAL FILTRERINGSLOGIK

        var icoEl = doc.getElementById('siteIco');
        if (icoEl) {
            icoEl.onerror = function() {
                this.style.display = 'none'
            }
        }
        if ($('closeBtn')) {
            $('closeBtn').onclick = function() {
                w.close()
            }
        }

        function visibleLis() {
            var a = [].slice.call($('l').children),
                out = [];
            for (var i = 0; i < a.length; i++) {
                if (a[i].style.display !== 'none') out.push(a[i])
            }
            return out
        }

        function uC() {
            $('count').innerText = visibleLis().length + ' / ' + TOTAL + ' URL:er visas'
        }

        function recomputeSlug() {
            var lis = visibleLis();
            var wordCounts = {},
                bigramCounts = {};
            for (var i = 0; i < lis.length; i++) {
                var li = lis[i];
                var a = li.querySelector('a');
                if (!a) continue;
                var su = a.href || a.textContent || '';
                var ssegs = segs(su);
                if (!ssegs.length) continue;
                var slug = ssegs[ssegs.length - 1];
                if (!slug) continue;
                slug = safeDecode(String(slug).toLowerCase());
                var tokens = slug.split(/[^0-9a-zåäö]+/i).filter(function(x) {
                    return x && /[a-zåäö]/i.test(x)
                });
                if (!tokens.length) continue;
                for (var ti = 0; ti < tokens.length; ti++) {
                    var w1 = tokens[ti];
                    if (!w1 || isStop(w1)) continue;
                    wordCounts[w1] = (wordCounts[w1] || 0) + 1
                }
                for (var bi = 0; bi < tokens.length - 1; bi++) {
                    var b1 = tokens[bi],
                        b2 = tokens[bi + 1];
                    if ((!b1 || isStop(b1)) && (!b2 || isStop(b2))) continue;
                    var key = b1 + ' ' + b2;
                    bigramCounts[key] = (bigramCounts[key] || 0) + 1
                }
            }
            var wordsTop = mapTopSlug(wordCounts).slice(0, 10);
            var allBig = mapTopSlug(bigramCounts);
            var recurringBig = allBig.filter(function(x) {
                return x.count > 1
            });
            var useBig = recurringBig.length ? recurringBig : allBig;
            var bigTop = useBig.slice(0, 10);
            var hasRecurring = recurringBig.length > 0;
            var wordsHtml = renderListForSlug(wordsTop, 'Inga ord hittades.');
            var bigHtml = renderListForSlug(bigTop, 'Inga tvåordsfraser hittades.');
            var wEl = doc.getElementById('slugWords');
            var bEl = doc.getElementById('slugBigrams');
            var lbl = doc.getElementById('slugBigLabel');
            if (wEl) wEl.innerHTML = wordsHtml;
            if (bEl) bEl.innerHTML = bigHtml;
            if (lbl) lbl.textContent = 'Tvåordsfraser' + (hasRecurring ? '*' : '')
        }

        function refresh() {
            uC();
            recomputeSlug()
        }

        function clearActiveRows() {
            // Rensa alla kategorigränssnitt (stora rader)
            var rs = [].slice.call(doc.querySelectorAll('#catRows .row'));
            for (var i = 0; i < rs.length; i++) {
                rs[i].classList.remove('rowActive');
            }

            // Rensa/Applicera visuell markering för knappar (Statistik, Djup, Tid, Årtal, etc.)
            var activeElems = doc.querySelectorAll('.depthBtn[data-depth], .timeRow, .yearChip[data-year], .statClick[data-kind], .riskChip, .thinChip, .catChip');
            
            activeElems.forEach(function(el) {
                el.classList.remove('filterActive');
                
                // Måste hanteras annorlunda för timeRow eftersom den har span inuti
                var targetEl = el.matches('.timeRow') ? el : el; 
                
                var isCurrentlyActive = false;
                
                // 1. Djup-knappar
                if (el.matches('.depthBtn') && activeFilters.depth !== null && parseInt(el.getAttribute('data-depth'), 10) === activeFilters.depth) {
                    isCurrentlyActive = true;
                }
                
                // 2. Tid/Range
                if (el.matches('.timeRow') && activeFilters.range === el.getAttribute('data-range')) {
                    isCurrentlyActive = true;
                }
                
                // 3. Årtal
                if (el.matches('.yearChip') && activeFilters.year === el.getAttribute('data-year')) {
                    isCurrentlyActive = true;
                }

                // 4. Stat/Metafilter
                if (el.matches('.statClick') && activeFilters.stat === el.getAttribute('data-kind')) {
                    isCurrentlyActive = true;
                }

                // 5. Kategori/Chip-filter (Risk/Thin/CatChip)
                if (el.matches('.riskChip, .thinChip, .catChip')) {
                     var l1 = el.getAttribute('data-l1');
                     if (activeFilters.category === l1 && !activeFilters.sub && !activeFilters.root) {
                        isCurrentlyActive = true;
                     }
                }
                
                if (isCurrentlyActive) {
                    targetEl.classList.add('filterActive');
                } else {
                    targetEl.classList.remove('filterActive');
                }
            });
            
            // Markera aktiv kategorigränsyta (rowActive)
            if (activeFilters.root) {
                var rootRow = doc.querySelector('#catRows .row[data-root="1"]');
                if (rootRow) rootRow.classList.add('rowActive');
            } else if (activeFilters.category) {
                var selector = activeFilters.sub 
                    ? '#catRows .row.subrow[data-parent="' + activeFilters.category + '"][data-sub="' + activeFilters.sub + '"]'
                    : '#catRows .row[data-l1="' + activeFilters.category + '"]:not([data-sub])';

                var catRow = doc.querySelector(selector);
                if (catRow) catRow.classList.add('rowActive');
            }
        }

        function collapseAllSubs() {
            var subs = [].slice.call(doc.querySelectorAll('.subrow'));
            for (var i = 0; i < subs.length; i++) {
                subs[i].style.display = 'none'
            }
        }
        
        // --- EVENT HANDLERS ---
        
        // Kryssruta för Kombinera filter
        (function() {
            var toggleEl = doc.getElementById('multiFilterToggle');
            if (toggleEl) {
                toggleEl.onchange = function() {
                    multiFilterMode = toggleEl.checked;
                    
                    if (!multiFilterMode) {
                        // Om vi stänger av multi-läge, rensa alla icke-sök filter
                        var searchVal = activeFilters.search;
                        clearAllNonSearchFilters();
                        activeFilters.search = searchVal;
                    }
                    applyFilters();
                };
            }
        })();


        // Rensa alla filter
        if ($('resetBtn')) {
            $('resetBtn').onclick = function() {
                // Återställ alla filter, inkl. sök
                activeFilters.search = '';
                clearAllNonSearchFilters();
                
                collapseAllSubs();
                
                // Återställ kryssrutan
                var toggleEl = doc.getElementById('multiFilterToggle');
                if(toggleEl) toggleEl.checked = false;
                multiFilterMode = false;
                
                applyFilters(); 
            }
        }

        // Sökfält
        if ($('k')) {
            (function() {
                var kEl = $('k');
                kEl.oninput = function() {
                    activeFilters.search = kEl.value.trim(); 
                    applyFilters();
                }
            })()
        }

        // Djupfilter
        (function() {
            var depthListEl = $('depthList');
            if (!depthListEl) return;
            depthListEl.addEventListener('click', function(ev) {
                var btn = ev.target.closest('.depthBtn');
                if (!btn) return;
                
                var d = parseInt(btn.getAttribute('data-depth') || '0', 10);
                var isActive = activeFilters.depth === d;

                if (!multiFilterMode && !isActive) {
                    clearAllNonSearchFilters();
                }

                if (isActive) {
                    activeFilters.depth = null;
                } else {
                    activeFilters.depth = d;
                }
                
                applyFilters();
            })
        })();

        // Åldersfilter (TimeFresh)
        (function() {
            var tf = doc.querySelector('.timeFresh');
            if (!tf) return;
            tf.addEventListener('click', function(ev) {
                var row = ev.target.closest('.timeRow');
                if (!row || !tf.contains(row)) return;
                
                var r = row.getAttribute('data-range') || '';
                var isActive = activeFilters.range === r;

                if (!multiFilterMode && !isActive) {
                    clearAllNonSearchFilters();
                }
                
                if (isActive) {
                    activeFilters.range = null;
                } else {
                    activeFilters.range = r;
                }

                applyFilters();
            })
        })();
        
        // Årtalsfilter & Statistik/Metafilter
        (function() {
            var stats = doc.querySelector('#stats');
            if (!stats) return;
            stats.addEventListener('click', function(ev) {
                var yBtn = ev.target.closest('.yearChip');
                if (yBtn && stats.contains(yBtn)) {
                    var y = yBtn.getAttribute('data-year') || '';
                    var isActive = activeFilters.year === y;
                    
                    if (!multiFilterMode && !isActive) {
                        clearAllNonSearchFilters();
                    }
                    
                    if (isActive) {
                        activeFilters.year = null;
                    } else {
                        activeFilters.year = y;
                    }
                    
                    applyFilters();
                    return;
                }
                
                // --- Statistik/Metafilter (missingLastmod, params, invalid, img, pdf) ---
                var btn = ev.target.closest('.statClick');
                if (!btn || !stats.contains(btn)) return;
                
                var kind = btn.getAttribute('data-kind') || '';
                var isActiveStat = activeFilters.stat === kind;

                if (!multiFilterMode && !isActiveStat) {
                    clearAllNonSearchFilters();
                }
                
                if (isActiveStat) {
                    activeFilters.stat = null;
                } else {
                    activeFilters.stat = kind;
                }
                
                applyFilters();
            })
        })();


        // Kategori-knappar (Chips: CatChip, RiskChip, ThinChip)
        (function() {
            var chipHandlers = function(ev) {
                var btn = ev.target.closest('[data-l1]');
                if (!btn) return;
                
                var cat = btn.getAttribute('data-l1') || '';
                var isActive = btn.classList.contains('filterActive'); 

                if (!multiFilterMode && !isActive) {
                    clearAllNonSearchFilters();
                    collapseAllSubs();
                }

                if (isActive) {
                    activeFilters.category = '';
                    activeFilters.sub = '';
                    activeFilters.root = false;
                    collapseAllSubs();
                } else {
                    activeFilters.category = cat;
                    activeFilters.sub = '';
                    activeFilters.root = false;
                    // Vi kan inte toggle subrader från chipsen, det görs via raderna
                }
                
                applyFilters();
            };
            
            var chips = doc.querySelectorAll('.catChip, .riskChip, .thinChip');
            chips.forEach(function(chip) { chip.addEventListener('click', chipHandlers); });
        })();


        // Kategori-rader (Rows) - ÅTGÄRDAD LOGIK FÖR AKTIVERING
        (function() {
            var wrap = $('catRows');
            if (!wrap) return;
            wrap.addEventListener('click', function(ev) {
                var row = ev.target.closest('.row');
                if (!row || !wrap.contains(row)) return;
                
                var isRoot = row.getAttribute('data-root') === '1',
                    parent = row.getAttribute('data-parent'), 
                    sub = row.getAttribute('data-sub'),       
                    l1 = row.getAttribute('data-l1');         

                var isActive = row.classList.contains('rowActive');

                // 1. Hantera expandering/kollaps AV subrader (görs endast på huvudrader)
                if (l1 && !parent) {
                    toggleSubsFor(l1); 
                }

                // 2. Hantera enkel-läge/nollställning
                if (!multiFilterMode && !isActive) {
                    // Om vi är i enkelt läge och klickar på ett nytt filter, rensa ALLA andra filter
                    clearAllNonSearchFilters();
                }
                
                // 3. Hantera toggle/sätta aktivt filter
                if (isActive) {
                    // Avaktivera
                    activeFilters.category = '';
                    activeFilters.sub = '';
                    activeFilters.root = false;
                } else {
                    // Aktivera
                    activeFilters.category = l1 || '';
                    activeFilters.sub = sub || '';
                    activeFilters.root = isRoot;
                }

                // 4. Filtrera listan
                applyFilters();
            })
        })();


        // Sök-chips (Slug words)
        doc.addEventListener('click', function(ev) {
            var btn = ev.target.closest('.slugWord');
            if (!btn || !doc.body.contains(btn)) return;
            ev.preventDefault();
            var term = (btn.getAttribute('data-slug') || '').trim();
            var kEl = $('k');
            
            // Sökning ersätter aldrig andra filter
            if (kEl) {
                activeFilters.search = term;
                kEl.value = term;
                applyFilters();
                kEl.focus()
            }
        });
        
        // --- DATA EXPORT & SORTING ---
        (function() {
            function getVisibleRows() {
                var lis = visibleLis(),
                    rows = [];
                for (var i = 0; i < lis.length; i++) {
                    var li = lis[i];
                    var a = li.querySelector('a');
                    if (!a) continue;
                    var url = a.href || a.textContent || '';
                    var ds = li.querySelector('.urlDate');
                    var date = '';
                    if (ds) {
                        var dtxt = (ds.textContent || '').trim();
                        date = dtxt.split(' ')[0] || ''
                    }
                    var age = li.getAttribute('data-age') || '';
                    rows.push({
                        url: url,
                        date: date,
                        age: age
                    })
                }
                return rows
            }

            function fallbackCopy(text) {
                var ta = doc.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.top = '0';
                ta.style.left = '0';
                ta.style.opacity = '0';
                doc.body.appendChild(ta);
                ta.focus();
                ta.select();
                try {
                    doc.execCommand('copy')
                } catch (e) {}
                doc.body.removeChild(ta)
            }
            var copyBtn = $('copyBtn'),
                dlBtn = $('downloadBtn'),
                statusBtn = $('statusBtn');
            if (copyBtn) {
                copyBtn.onclick = function() {
                    var rows = getVisibleRows();
                    if (!rows.length) {
                        alert('Inga URL:er att kopiera.');
                        return
                    }
                    var lines = ['URL\tDatum\tAlder_dagar'];
                    for (var i = 0; i < rows.length; i++) {
                        lines.push(rows[i].url + '\t' + rows[i].date + '\t' + rows[i].age)
                    }
                    var text = lines.join('\n'); 

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).catch(function() {
                            fallbackCopy(text)
                        })
                    } else {
                        fallbackCopy(text)
                    }
                }
            }
            if (dlBtn) {
                dlBtn.onclick = function() {
                    var rows = getVisibleRows();
                    if (!rows.length) {
                        alert('Inga URL:er att ladda ner.');
                        return
                    }
                    var csv = ['\"URL\";\"Datum\";\"Alder_dagar\"'];
                    for (var i = 0; i < rows.length; i++) {
                        var r = rows[i];
                        var u = r.url.replace(/\"/g, '\"\"');
                        var d = r.date.replace(/\"/g, '\"\"');
                        var a = (r.age || '').toString().replace(/\"/g, '\"\"');
                        csv.push('\"' + u + '\";\"' + d + '\";\"' + a + '\"')
                    }
                    var blob = new Blob([csv.join('\n')], {
                        type: 'text/csv;charset=utf-8;'
                    });
                    var aEl = doc.createElement('a');
                    aEl.href = URL.createObjectURL(blob);
                    aEl.download = 'sitemap-url-list.csv';
                    doc.body.appendChild(aEl);
                    aEl.click();
                    setTimeout(function() {
                        URL.revokeObjectURL(aEl.href);
                        doc.body.removeChild(aEl)
                    }, 0)
                }
            }
            if (statusBtn) {
                statusBtn.onclick = function() {
                    var lis = visibleLis();
                    if (!lis.length) {
                        alert('Inga URL:er att kontrollera.');
                        return
                    }
                    var total = lis.length,
                        idx = 0,
                        orig = statusBtn.textContent;
                    statusBtn.disabled = true;
                    statusBtn.textContent = 'Kontrollerar...';

                    function next() {
                        if (idx >= total) {
                            statusBtn.disabled = false;
                            statusBtn.textContent = orig;
                            return
                        }
                        var li = lis[idx++];
                        var a = li.querySelector('a');
                        if (!a) {
                            next();
                            return
                        }
                        var url = a.href;
                        var stSpan = li.querySelector('.urlStatus');
                        if (!stSpan) {
                            stSpan = doc.createElement('span');
                            stSpan.className = 'urlStatus';
                            li.appendChild(stSpan)
                        }
                        stSpan.textContent = '...';
                        fetch(url, {
                            method: 'HEAD'
                        }).then(function(resp) {
                            var s = resp.status || 0;
                            var finalUrl = resp.url || url;
                            var changed = finalUrl && finalUrl !== url;
                            var txt = s || '?';
                            var cls = 'urlStatus other';
                            if (!s) {
                                cls = 'urlStatus other'
                            } else if (s === 404 || s === 410) {
                                cls = 'urlStatus notfound'
                            } else if (s >= 300 && s < 400) {
                                cls = 'urlStatus redirect'
                            } else if (s >= 200 && s < 300) {
                                cls = 'urlStatus ok'
                            } else {
                                cls = 'urlStatus other'
                            }
                            if (changed && s >= 200 && s < 400) {
                                cls = 'urlStatus redirect';
                                txt = (s || '?') + ' (redir)'
                            }
                            stSpan.textContent = txt;
                            stSpan.className = cls;
                            next()
                        }).catch(function() {
                            stSpan.textContent = 'ERR';
                            stSpan.className = 'urlStatus err';
                            next()
                        })
                    }
                    next()
                }
            }
        })();
        (function() {
            var ul = $('l');
            if (!ul) return;

            function sortBy(fn) {
                var arr = [].slice.call(ul.children);
                arr.sort(fn);
                for (var i = 0; i < arr.length; i++) {
                    ul.appendChild(arr[i])
                }
                refresh()
            }
            var btnDef = $('sortDefaultBtn'),
                btnDate = $('sortDateBtn'),
                btnName = $('sortNameBtn'),
                dateAsc = true,
                nameAsc = true;
            if (btnDef) {
                btnDef.onclick = function() {
                    dateAsc = true;
                    nameAsc = true;
                    if (btnDate) btnDate.textContent = 'Datum';
                    if (btnName) btnName.textContent = 'Namn';
                    sortBy(function(a, b) {
                        var ia = parseInt(a.getAttribute('data-idx') || '0', 10),
                            ib = parseInt(b.getAttribute('data-idx') || '0', 10);
                        return ia - ib
                    })
                }
            }
            if (btnDate) {
                btnDate.onclick = function() {
                    dateAsc = !dateAsc;
                    btnDate.textContent = 'Datum ' + (dateAsc ? '↑' : '↓');
                    sortBy(function(a, b) {
                        var da = a.getAttribute('data-age') || '',
                            db = b.getAttribute('data-age') || '';
                        var ia = da ? parseInt(da, 10) : 1e9,
                            ib = db ? parseInt(db, 10) : 1e9;
                        return dateAsc ? (ia - ib) : (ib - ia)
                    })
                }
            }
            if (btnName) {
                btnName.onclick = function() {
                    nameAsc = !nameAsc;
                    btnName.textContent = 'Namn ' + (nameAsc ? 'A→Ö' : 'Ö→A');
                    sortBy(function(a, b) {
                        var ta = (a.querySelector('a') ? a.querySelector('a').textContent : '').toLowerCase();
                        var tb = (b.querySelector('a') ? b.querySelector('a').textContent : '').toLowerCase();
                        if (ta < tb) return nameAsc ? -1 : 1;
                        if (ta > tb) return nameAsc ? 1 : -1;
                        return 0
                    })
                }
            }
        })();
        
        applyFilters(); // Initial körning
    }
    if (syntheticEl) {
        var txt = syntheticEl.value || syntheticEl.textContent || '';
        if (!txt) {
            E('Kunde inte hitta genererad sitemap-XML i fönstret.');
            return
        }
        runWithXmlText(txt)
    } else {
        fetch(location.href).then(function(r) {
            return r.text()
        }).then(function(txt) {
            runWithXmlText(txt)
        }).catch(function(e) {
            E('Fel vid hämtning: ' + e.message)
        })
    }
})();
