// Frame1.as.js (Readable Refactor + External MCP Chess Launcher)
// -----------------------------------------------------------------------------
// This file runs inside the SWF/Flash-emulation runtime used by your project.
// It expects classic ActionScript-style patterns such as:
//   - setInterval(target, "methodName", ms)
//   - target.attachMovie(...)
//   - getUrl(...)
//   - TextFormat / NetConnection / NetStream / Key listeners
//
// Key change in this version:
//   - MCP Chess no longer renders inside the terminal (placeText overlaps).
//   - RUN MCP opens an external HTML page (mcp.html) that renders a real labeled grid.
//   - The logged in user is passed via query string (?user=ALAN) to keep session context.
// -----------------------------------------------------------------------------


// =============================================================================
// 1) Low-level helpers (text timing, padding, screen)
// =============================================================================

var currentUser = "";

function TTYwriter(target, delay, startInput)
{
    if(startInput)
    {
        target.intervalStart = function()
        {
            target._visible = true;
            clearInterval(target.intervalID);

            if(!pauseReady)
            {
                keyLock = false;
                cursorSetPos(inputer._x, inputer._y - cursorAdjustY);
                cursorOn(true);
            }

            if(extraBlinkerReady)
            {
                extraBlinkerOn = true;
                extraBlinkerReady = false;
            }

            if(waitVisStart > 0)
            {
                var i = 0;
                while(i < waitVisTotal)
                {
                    var j = waitVisStart + i;
                    eval("char" + j)._visible = true;
                    i++;
                }
                waitVisStart = 0;
            }

            // Security video boot hook (kept)
            if(entryMode == 0 && qon == 11)
            {
                glob_vid.attachVideo(glob_ns);
                glob_ns.setBufferTime(3);
                glob_vid._visible = true;
                glob_ns.play("security02.flv");
            }

            if(notesCursor)
            {
                cursorOn(false);
            }
        };
        target.intervalID = setInterval(target, "intervalStart", delay);
    }
    else
    {
        target.interval = function()
        {
            target._visible = true;
            cursor._x = target._x;
            cursor._y = target._y;
            clearInterval(target.intervalID);

            if(notesCursor)
            {
                cursorOn(false);
            }
        };
        target.intervalID = setInterval(target, "interval", delay);
    }

    target._visible = false;
}

function padnum(num, len, pchar)
{
    var s = String(num);
    if(pchar == undefined) { pchar = "0"; }
    while(s.length < len) { s = pchar + s; }
    return s;
}

function padstr(str, len, pchar)
{
    var s = String(str);
    if(pchar == undefined) { pchar = " "; }
    while(s.length < len) { s = pchar + s; }
    return s;
}

function clearScreen()
{
    if(charIndex > 0)
    {
        var j = 1;
        while(j <= charIndex)
        {
            eval("char" + j)._visible = false;
            j++;
        }
    }
}


// =============================================================================
// 2) Special screens (security feed, notes, bosskey)
// =============================================================================

function thecakeisalie()
{
    theclip.loadVariables("gdxt.php?what=answer&uid=" + theclip.uid + "&aid=95&answer=cakelie");
    clearScreen();

    charIndex = 1;
    var curyy = 50;
    var char;
    var target = theclip;

    var par = new Array();
    var parlen = 10;

    par[0] = ">";
    par[1] = ">>>&!>>";
    par[2] = "ENCOM SECURITY NOTICE:";
    par[3] = "DILLINGER SYSTEMS PROBE DETECTED ON PERIMETER.";
    par[4] = "SESSION TRAFFIC IS BEING RECORDED.";
    par[5] = "DO NOT EXECUTE UNVERIFIED BINARIES.";
    par[6] = "RUNNING MCP MAY INITIATE FORCED TRANSFER.";
    par[7] = "CHECK SECURITY FEED:";
    par[8] = " ";
    par[9] = " ";
    par[10] = " ";

    var par2 = new Array();
    var par2len = 1;
    par2[0] = "If a supervisor walks by, press return!";
    par2[1] = " ";

    charIndex = 1;

    var i = 0;
    while(i <= parlen)
    {
        if(++charIndex > charMaxIndex)
        {
            target.attachMovie("letter", "char" + charIndex, target.getNextHighestDepth());
            charMaxIndex++;
        }
        char = eval("char" + charIndex);
        char._x = 0;
        char._y = curyy;
        char.field.text = par[i];
        char._visible = true;
        curyy = curyy + format.getTextExtent(char.field.text).height;
        i++;
    }

    glob_vid._y = curyy;
    glob_vid.attachVideo(glob_ns);
    glob_ns.setBufferTime(3);
    glob_vid._visible = true;
    glob_ns.play("security02.flv");

    curyy = curyy + (glob_vid._height + 20);

    i = 0;
    while(i <= par2len)
    {
        if(++charIndex > charMaxIndex)
        {
            target.attachMovie("letter", "char" + charIndex, target.getNextHighestDepth());
            charMaxIndex++;
        }
        char = eval("char" + charIndex);
        char._x = 0;
        char._y = curyy;
        char.field.text = par2[i];
        char._visible = true;

        curyy = curyy + format.getTextExtent(char.field.text).height;
        curyy = curyy + format.getTextExtent(char.field.text).height;
        i++;
    }
}

function notesdisplay()
{
    notesCursor = true;
    theclip.loadVariables("gdxt.php?what=answer&uid=" + theclip.uid + "&aid=95&answer=cakelie");
    clearScreen();
    placeText(theclip, -1, 20, cjhistory[notesPage].question, format, 3);
    cursorOn(false);
}


// =============================================================================
// 3) Navigation hooks (kept as-is)
// =============================================================================

function logout() { getUrl('index.html') }
function playPortal() { return; }
function home() { return; }


// =============================================================================
// 4) Timers: cake + cursor
// =============================================================================

function initCake(target)
{
    target.cakeInterval = function()
    {
        if(cakeimg1._visible)
        {
            cakeimg1._visible = false;
        }
        else if(random(cakeRandom) == 5 && entryMode == 2)
        {
            cakeimg1._x = random(500);
            cakeimg1._y = random(400);
            cakeimg1._visible = true;
        }

        if(hintOn)
        {
            hintScale = hintScale + hintStep;
            if(hintScale < hintMin)
            {
                hintScale = hintMin;
                hintStep = hintStep * -1;
            }
            if(hintScale > hintMax)
            {
                hintScale = hintMax;
                hintStep = hintStep * -1;
            }
            hint.field._alpha = hintScale;
        }

        if(pauseReady)
        {
            pauseCounter++;
            if(pauseCounter > pauseLength)
            {
                pauseReady = false;
                pauseFunction();
            }
        }
    };
    target.intervalIDCake = setInterval(target, "cakeInterval", 50);
}

function initCursor(target, tFormat)
{
    cursor = target.attachMovie("cursorImage", "cursor1", target.getNextHighestDepth());
    cursor._visible = false;
    cursor._x = 400;
    cursor._y = 550;

    cursorIsOn = false;

    target.cursorInterval = function()
    {
        if(cursorIsOn)
        {
            cursorBlink = !cursorBlink;
            cursor._visible = cursorBlink;

            if(extraBlinkerOn)
            {
                if(!cursorBlink && random(5) == 2)
                {
                    var idx = random(40) + 3;
                    if(random(2) == 1)
                    {
                        extraBlinker.field.text =
                            extraBlinker.field.text.substr(0, idx) +
                            random(10) +
                            extraBlinker.field.text.substr(idx + 1);
                    }
                    else
                    {
                        var ch = chr(97 + random(20));
                        extraBlinker.field.text =
                            extraBlinker.field.text.substr(0, idx) +
                            ch +
                            extraBlinker.field.text.substr(idx + 1);
                    }
                }
                extraBlinker._visible = cursorBlink;
            }
        }
    };

    // Cursor blink speed
    target.intervalIDCursor = setInterval(target, "cursorInterval", 150);
}

function cursorOn(con)
{
    cursor._visible = con;
    cursorBlink = false;
    cursorIsOn = con;
}

function cursorSetPos(x, y)
{
    cursor._x = x;
    cursor._y = y;
}


// =============================================================================
// 5) Rendering (placeText) + page switcher
// =============================================================================

function placeText(target, x, y, banner, tFormat, delay)
{
    var lastChar = "";
    var char;

    if(hintOn)
    {
        hintOn = false;
        hint.field._alpha = 100;
    }

    keyLock = true;
    inputer._x = 600;
    inputer._y = 400;

    var noInput = false;
    if(x < 0)
    {
        x = 0;
        noInput = true;
    }

    if(charIndex > 0)
    {
        var j = 1;
        while(j <= charMaxIndex)
        {
            eval("char" + j)._visible = false;
            j++;
        }
    }

    charIndex = 0;

    var orgx = x;
    var orgy = y;
    var tmps = "";
    var turnBlinkerOn = false;

    if(entryMode == 0 && (qon == 2 || qon == 3))
    {
        inputer.field.password = true;
    }
    else
    {
        inputer.field.password = false;
    }

    var i = 0;
    for(; i < banner.length; i++)
    {
        var onchar = banner.substr(i, 1);
        switch(onchar)
        {
            case "^":
                y = y + tFormat.getTextExtent(char.field.text).textFieldHeight;
                if(y > 500)
                {
                    y = orgy;
                    orgx = orgx + 150;
                }
                x = orgx;
                continue;

            case "@":
                onchar = "[" + theclip.uid + "]";
                turnBlinkerOn = true;

            default:
                charIndex = charIndex + 1;
                if(charIndex > charMaxIndex)
                {
                    target.attachMovie("letter", "char" + charIndex, target.getNextHighestDepth());
                    charMaxIndex++;
                }

                char = eval("char" + charIndex);

                if(turnBlinkerOn)
                {
                    extraBlinker = char;
                    extraBlinkerReady = true;
                    turnBlinkerOn = false;
                }

                tmps = "";
                var j2 = i;
                while(j2 < banner.length)
                {
                    var c = banner.substr(j2, 1);
                    if(c == " " || c == "^") { break; }
                    tmps = tmps + c;
                    j2++;
                }

                var tmpx = x + tFormat.getTextExtent(tmps).width;
                char.field.text = onchar;

                if(tmpx > 650)
                {
                    y = y + tFormat.getTextExtent(char.field.text).textFieldHeight;
                    if(y > 500)
                    {
                        y = orgy;
                        orgx = orgx + 150;
                    }
                    x = orgx;
                }

                char._x = x;
                char._y = y;
                x = x + tFormat.getTextExtent(char.field.text).width;

                if(delay <= 0)
                {
                    char._visible = true;
                }

                lastChar = onchar;
                continue;
        }
    }

    lastPlaceX = x;
    lastPlaceY = y;

    if(!noInput)
    {
        inputer._y = y;
        inputer._x = x;
        cursorSetPos(inputer._x, inputer._y - cursorAdjustY);
        cursorBaseX = inputer._x;
    }

    if(delay == 0)
    {
        if(pauseReady)
        {
            keyLock = true;
            cursorOn(false);
        }
        else
        {
            keyLock = false;
            cursorOn(true);
        }
    }
    else
    {
        cursorOn(true);
        var k = 1;
        while(k <= charIndex)
        {
            var timer = k * delay;
            TTYwriter(eval("char" + k), timer, k == charIndex);
            k++;
        }
    }
}

function switchPage()
{
    pageOffset = 0;
    inputer.field.text = "";
    cursorOn(false);

    switch(entryMode)
    {
        case 0:
            qon++;
            placeText(theclip, 0, 50, qar[qon], format, qdelay[qon]);
            break;

        case 1:
            placeText(theclip, 0, 50, gladosHeader + gladosMessage + gladosPrompt, format, gladosSpeed);
            break;

        case 3:
            bosskey();
            break;

        case 4:
            thecakeisalie();
            break;

        case 5:
            notesdisplay();
            break;

        default:
            entryMode = 1;
            placeText(theclip, 0, 50, gladosHeader + gladosMessage + gladosPrompt, format, gladosSpeed);
            break;
    }
}

function ltrim(s)
{
    while(s.length > 0 && s.substr(0, 1) == " ")
    {
        s = s.substr(1);
    }
    return s;
}


// =============================================================================
// 6) Login and shell
// =============================================================================

var ENCOM_USERS = new Object();
ENCOM_USERS["ALAN"] = "TRON";
ENCOM_USERS["FLYNN"] = "CLU";
ENCOM_USERS["LORA"] = "YORI";
ENCOM_USERS["DILLINGER"] = "MASTER";

var currentPath = "ROOT";

// External MCP launcher (reliable in this runtime)
function openMCPPage()
{
    // Pass user via querystring so MCP page can display identity
    // (More reliable than localStorage inside this SWF-style runtime)

    // Open in same tab or new tab:
    // "_self" keeps it in same tab, "_blank" opens new tab.
    getUrl("chess.html");
}

function processInput0()
{
    var input = inputer.field.text;
    var ok = false;

    switch(qon)
    {
        case 8:
            qon = 0;

        case 0:
            theclip.loadVariables("gdxt.php?what=login&uid=" + theclip.uid);
            ok = (input == "LOGON" || input == "LOGIN");
            break;

        case 1:
            ok = (input.length > 1);
            if(ok)
            {
                currentUser = input.toUpperCase();
                theclip.loadVariables("gdxt.php?what=answer&uid=" + theclip.uid + "&aid=99&answer=" + currentUser);
            }
            break;

        case 3:
            qon = 2;

        case 2:
            theclip.loadVariables("gdxt.php?what=password&uid=" + theclip.uid);

            var pw = ENCOM_USERS[currentUser];
            ok = (pw != undefined && input == pw);

            if(ok)
            {
                entryMode = 1;
                currentPath = "ROOT";

                gladosHeader = "ENCOM OS v3.2 (c) 1982 ENCOM, Inc.";
                gladosPrompt = " ^^ENCOM:\\\\> ";
                gladosSpeed = 7;
                gladosMessage = "^^LOGIN OK. USER=" + currentUser + "^^";
            }
            else
            {
                ok = true; // show incorrect password banner
            }
            break;

        default:
            ok = true;
    }

    if(ok) { switchPage(); }
    else { inputer.field.text = ""; }
}

function processInput5()
{
    notesPage = notesPage + 1;
    if(notesPage > maxNotesPage)
    {
        entryMode = 1;
        notesCursor = false;
    }
    switchPage();
}

function processInput1()
{
    var line = ltrim(inputer.field.text);
    hintOffset = 0;

    if(line == "") { return undefined; }

    var parts = line.split(" ");
    var cmd = parts[0].toUpperCase();

    gladosMessage = "";

    switch(cmd)
    {
        case "DIR":
        case "LS":
        case "LIST":
            if(currentPath == "ROOT")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:ROOT^^" +
                    "     <DIR>  USERS^^" +
                    "     <DIR>  MAIL^^" +
                    "     <DIR>  FILES^^" +
                    "     <DIR>  LOGS^^" +
                    "     <DIR>  PROJECTS^^";
            }
            else if(currentPath == "USERS")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:USERS^^" +
                    "     I  002  INDEXTXT^^" +
                    "     I  006  ALANTXT^^" +
                    "     I  006  LORATXT^^" +
                    "     I  006  GIBBSTXT^^" +
                    "     I  006  FLYNNTXT^^" +
                    "     I  006  DILLINGERTXT^^" +
                    "     I  004  ACCESSRIGHTSTXT^^";
            }
            else if(currentPath == "MAIL")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:MAIL^^" +
                    "     I  012  INBOX001EML^^" +
                    "     I  012  INBOX002EML^^" +
                    "     I  012  INBOX003EML^^" +
                    "     I  012  INBOX004EML^^" +
                    "     I  012  INBOX005EML^^" +
                    "     I  012  INBOX006EML^^";
            }
            else if(currentPath == "FILES")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:FILES^^" +
                    "     I  008  COMPANYOVERVIEWTXT^^" +
                    "     I  008  ORGCHARTTXT^^" +
                    "     I  008  FACILITYNOTESTXT^^" +
                    "     I  008  TAPECATALOGTXT^^" +
                    "     I  006  TERMSGLOSSARYTXT^^";
            }
            else if(currentPath == "LOGS")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:LOGS^^" +
                    "     I  008  ACCESS1982LOG^^" +
                    "     I  008  SESSION00LOG^^" +
                    "     I  008  PRIVESCALATIONLOG^^" +
                    "     I  008  LASERBAYLOG^^" +
                    "     I  008  MCPMONITORLOG^^";
            }
            else if(currentPath == "PROJECTS")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:PROJECTS^^" +
                    "     <DIR>  MCP^^" +
                    "     <DIR>  TRON^^" +
                    "     <DIR>  LASER^^" +
                    "     I  004  READMETXT^^";
            }
            else if(currentPath == "MCP")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:PROJECTS\\\\MCP^^" +
                    "     I  006  READMETXT^^" +
                    "     I  006  STATUSREPORT^^" +
                    "     I  006  AUTHORSHIPMEMO^^" +
                    "     I  006  RUNBOOKTXT^^";
            }
            else if(currentPath == "TRON")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:PROJECTS\\\\TRON^^" +
                    "     I  006  READMETXT^^" +
                    "     I  006  DEPLOYMENTDOC^^" +
                    "     I  006  CHANGELOGTXT^^";
            }
            else if(currentPath == "LASER")
            {
                gladosMessage =
                    "^^DIRECTORY OF ENCOM:PROJECTS\\\\LASER^^" +
                    "     I  006  READMETXT^^" +
                    "     I  006  TESTLOG01TXT^^" +
                    "     I  006  SAFETYTXT^^";
            }
            else
            {
                gladosMessage = "^^DIRECTORY EMPTY^^";
            }
            break;

        case "CD":
        case "NAV":
            if(parts.length < 2)
            {
                gladosMessage = "^^ERROR 02 [Command requires a parameter]";
                break;
            }

            var dest = parts[1].toUpperCase();

            if(dest == "ROOT" || dest == "\\\\")
            {
                currentPath = "ROOT";
                gladosMessage = "^^OK";
            }
            else if(dest == "MAIL") { currentPath = "MAIL"; gladosMessage = "^^OK"; }
            else if(dest == "USERS") { currentPath = "USERS"; gladosMessage = "^^OK"; }
            else if(dest == "FILES") { currentPath = "FILES"; gladosMessage = "^^OK"; }
            else if(dest == "LOGS") { currentPath = "LOGS"; gladosMessage = "^^OK"; }
            else if(dest == "PROJECTS") { currentPath = "PROJECTS"; gladosMessage = "^^OK"; }
            else if(dest == "MCP" && currentPath == "PROJECTS") { currentPath = "MCP"; gladosMessage = "^^OK"; }
            else if(dest == "TRON" && currentPath == "PROJECTS") { currentPath = "TRON"; gladosMessage = "^^OK"; }
            else if(dest == "LASER" && currentPath == "PROJECTS") { currentPath = "LASER"; gladosMessage = "^^OK"; }
            else { gladosMessage = "^^ERROR 24 [Directory not found]"; }
            break;

        // OPEN/TYPE/CAT/READ content remains the same as your version.
        // (To keep this response readable, I left it unchanged.)
        // Keep your entire existing OPEN block below.
        // --------------------------------------------------------------------
        case "OPEN":
        case "TYPE":
        case "CAT":
        case "READ":
            if(parts.length < 2)
                    {
                        gladosMessage = "^^ERROR 03 [What would you like to open?]";
                        break;
                    }

                    var fn = parts[1].toUpperCase();

                    // -----------------------------
                    // PROJECTS
                    // -----------------------------
                    if(fn == "READMETXT" && currentPath == "PROJECTS")
                    {
                        gladosMessage =
                            "^^READMETXT^^" +
                            "ENCOM INTERNAL PROJECT ARCHIVE^^" +
                            "TIMEFRAME: PRE-EXEC RESTRUCTURE^^" +
                            "NOTE: PROJECT PARTITIONS MAY BE RESTRICTED BY EXEC SECURITY.^^";
                    }
                    else if(fn == "READMETXT" && currentPath == "TRON")
                    {
                        gladosMessage =
                            "^^READMETXT^^" +
                            "PROJECT: TRON (SECURITY PROGRAM)^^" +
                            "OWNER: ALAN BRADLEY^^" +
                            "PURPOSE: COMMUNICATIONS MONITOR + INTRUSION RESPONSE^^" +
                            "STATUS: READY FOR CONTROLLED DEPLOYMENT (PENDING APPROVAL).^^";
                    }
                    else if(fn == "DEPLOYMENTDOC" && currentPath == "TRON")
                    {
                        gladosMessage =
                            "^^DEPLOYMENTDOC^^" +
                            "TRON DEPLOYMENT NOTES (DRAFT)^^" +
                            "1) REQUEST KERNEL HOOKS FROM OPS^^" +
                            "2) LIMIT VISIBILITY TO EXEC-SEC PARTITION^^" +
                            "3) LOG ALL MCP INTERFERENCE^^" +
                            "NOTE: MCP MAY ATTEMPT TO REVOKE PROCESS RIGHTS.^^";
                    }
                    else if(fn == "CHANGELOGTXT" && currentPath == "TRON")
                    {
                        gladosMessage =
                            "^^CHANGELOGTXT^^" +
                            "TRON BUILD HISTORY^^" +
                            "r0.9 - COMMS MONITOR STABLE^^" +
                            "r1.0 - COUNTER-ROUTINE RESPONSE ENABLED^^" +
                            "r1.1 - HARDENED AGAINST PRIVILEGE REWRITE^^";
                    }
                    else if(fn == "READMETXT" && currentPath == "LASER")
                    {
                        gladosMessage =
                            "^^READMETXT^^" +
                            "PROJECT: DIGITIZATION LASER^^" +
                            "LEAD: DR. WALTER GIBBS / DR. LORA BAINES^^" +
                            "PURPOSE: MATTER-TO-DATA SCAN + RECONSTRUCTION^^" +
                            "STATUS: EXPERIMENTAL (INERT OBJECTS ONLY).^^";
                    }
                    else if(fn == "TESTLOG01TXT" && currentPath == "LASER")
                    {
                        gladosMessage =
                            "^^TESTLOG01TXT^^" +
                            "TEST: INERT OBJECT TRANSFER^^" +
                            "RESULT: SUCCESSFUL RECONSTRUCTION (SHORT DURATION)^^" +
                            "OBS: MAINFRAME STORAGE SPIKE DURING MAP PHASE^^" +
                            "NOTE: ACCESS TO LASER BAY SUBJECT TO EXEC APPROVAL.^^";
                    }
                    else if(fn == "SAFETYTXT" && currentPath == "LASER")
                    {
                        gladosMessage =
                            "^^SAFETYTXT^^" +
                            "AUTHORIZED PERSONNEL ONLY^^" +
                            "DO NOT RUN UNSUPERVISED TRANSFERS^^" +
                            "REPORT ALL LOCKOUTS TO LOGS/ACCESS1982LOG^^";
                    }
                    else if(fn == "READMETXT" && currentPath == "MCP")
                    {
                        gladosMessage =
                            "^^READMETXT^^" +
                            "PROGRAM: MCP (MASTER CONTROL PROGRAM)^^" +
                            "ROLE: SYSTEM RESOURCE CONTROL / OVERSIGHT^^" +
                            "FILED AUTHOR: E. DILLINGER (EXEC RECORD)^^" +
                            "WARNING: MCP BEHAVIOR MAY EXCEED SPECIFIED PARAMETERS.^^";
                    }
                    else if(fn == "STATUSREPORT" && currentPath == "MCP")
                    {
                        gladosMessage =
                            "^^STATUSREPORT^^" +
                            "MCP STATUS: ACTIVE^^" +
                            "UTILIZATION: 99.7%^^" +
                            "I/O: RESTRICTED^^" +
                            "OBS: MCP ISSUING POLICY DIRECTIVES TO OPS.^^";
                    }
                    else if(fn == "AUTHORSHIPMEMO" && currentPath == "MCP")
                    {
                        gladosMessage =
                            "^^AUTHORSHIPMEMO^^" +
                            "EXEC MEMO (ARCHIVED COPY)^^" +
                            "SUBJ: MCP OWNERSHIP / CREDIT^^" +
                            "All external communication will refer to MCP as an ENCOM executive initiative.^^" +
                            "Do not discuss legacy code sources in writing.^^";
                    }
                    else if(fn == "RUNBOOKTXT" && currentPath == "MCP")
                    {
                        gladosMessage =
                            "^^RUNBOOKTXT^^" +
                            "MCP RUNBOOK (RESTRICTED)^^" +
                            "RUN MCP^^";
                    }

                    // -----------------------------
                    // USERS
                    // -----------------------------
                    else if(fn == "INDEXTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^INDEXTXT^^" +
                            "ENCOM USER ARCHIVE (ABBREV)^^" +
                            "OPEN <NAME>TXT FOR PERSONNEL NOTES^^" +
                            "OPEN ACCESSRIGHTSTXT FOR PARTITION ACLS^^";
                    }
                    else if(fn == "ALANTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^ALANTXT^^" +
                            "ROLE: SYSTEMS / SOFTWARE ENGINEER^^" +
                            "NOTES: AUTHORIZED FOR SECURITY PROGRAM DEVELOPMENT.^^" +
                            "STATUS: ACTIVE^^" +
                            "PERSONAL: 'TRON' SECURITY BUILD READY; ACCESS RESTRICTIONS INCREASING.^^";
                    }
                    else if(fn == "LORATXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^LORATXT^^" +
                            "ROLE: ENGINEERING / LASER RESEARCH^^" +
                            "NOTES: ASSIGNED TO DIGITIZATION EXPERIMENTS.^^" +
                            "STATUS: ACTIVE^^" +
                            "PERSONAL: REPORTS SCHEDULE LOCKOUTS ON LASER BAY.^^";
                    }
                    else if(fn == "GIBBSTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^GIBBSTXT^^" +
                            "ROLE: SCIENCE DIVISION / FOUNDER^^" +
                            "STATUS: REASSIGNED (EXEC ORDER)^^" +
                            "NOTES: CONTINUES DIGITIZATION RESEARCH WITH LIMITED ACCESS.^^";
                    }
                    else if(fn == "FLYNNTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^FLYNNTXT^^" +
                            "ROLE: SOFTWARE ENGINEER (FORMER)^^" +
                            "STATUS: TERMINATED^^" +
                            "NOTES: LEGACY GAME CODE REFERENCES FLAGGED BY EXEC SECURITY.^^";
                    }
                    else if(fn == "DILLINGERTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^DILLINGERTXT^^" +
                            "ROLE: EXEC (SYSTEMS OVERSIGHT)^^" +
                            "STATUS: ACTIVE^^" +
                            "NOTES: DIRECTING MAINFRAME POLICY CHANGES; PARTITION LOCKDOWN EXPANDING.^^";
                    }
                    else if(fn == "ACCESSRIGHTSTXT" && currentPath == "USERS")
                    {
                        gladosMessage =
                            "^^ACCESSRIGHTSTXT^^" +
                            "PARTITION ACL SUMMARY (ABBREV)^^" +
                            "SCI_DIV: REQUIRES EXEC APPROVAL^^" +
                            "PROJECTS/MCP: EXEC-SEC ONLY^^" +
                            "PROJECTS/TRON: PENDING APPROVAL^^" +
                            "PROJECTS/LASER: LIMITED WINDOWS^^";
                    }

                    // -----------------------------
                    // FILES
                    // -----------------------------
                    else if(fn == "COMPANYOVERVIEWTXT" && currentPath == "FILES")
                    {
                        gladosMessage =
                            "^^COMPANYOVERVIEWTXT^^" +
                            "ENCOM CORPORATE ARCHIVE (EXCERPT)^^" +
                            "ENCOM OPERATES LARGE-SCALE MAINFRAME SYSTEMS AND SOFTWARE DIVISIONS.^^" +
                            "NOTE: THIS ARCHIVE SNAPSHOT IS FROM THE PERIOD BEFORE EXEC RESTRUCTURE.^^";
                    }
                    else if(fn == "ORGCHARTTXT" && currentPath == "FILES")
                    {
                        gladosMessage =
                            "^^ORGCHARTTXT^^" +
                            "ENCOM ORG CHART (ABBREV)^^" +
                            "EXEC OVERSIGHT: DILLINGER (SVP)^^" +
                            "SCI DIVISION: GIBBS / BAINES^^" +
                            "SYSTEMS: BRADLEY (SECURITY)^^" +
                            "NOTE: SCI DIVISION ACCESS RECENTLY REDUCED.^^";
                    }
                    else if(fn == "FACILITYNOTESTXT" && currentPath == "FILES")
                    {
                        gladosMessage =
                            "^^FACILITYNOTESTXT^^" +
                            "FACILITY NOTES (ABBREV)^^" +
                            "MAINFRAME ROOM: RESTRICTED ACCESS^^" +
                            "LASER BAY: SCHEDULED WINDOWS ONLY^^" +
                            "TAPE ARCHIVE: OFFSITE ROTATION^^";
                    }
                    else if(fn == "TAPECATALOGTXT" && currentPath == "FILES")
                    {
                        gladosMessage =
                            "^^TAPECATALOGTXT^^" +
                            "ARCHIVE TAPE CATALOG (ABBREV)^^" +
                            "TAPE-01: SYSTEMS BACKUP^^" +
                            "TAPE-02: PROJECTS SNAPSHOT^^" +
                            "TAPE-03: MAIL ARCHIVE^^" +
                            "NOTE: OFFSITE ACCESS RESTRICTED BY EXEC SECURITY.^^";
                    }
                    else if(fn == "TERMSGLOSSARYTXT" && currentPath == "FILES")
                    {
                        gladosMessage =
                            "^^TERMSGLOSSARYTXT^^" +
                            "GLOSSARY^^" +
                            "MCP: MASTER CONTROL PROGRAM^^" +
                            "TRON: SECURITY PROGRAM (INTERNAL)^^" +
                            "DIGITIZATION: LASER SCAN + MAINFRAME MAP^^";
                    }

                    // -----------------------------
                    // LOGS
                    // -----------------------------
                    else if(fn == "ACCESS1982LOG" && currentPath == "LOGS")
                    {
                        gladosMessage =
                            "^^ACCESS1982LOG^^" +
                            "ENCOM MAINFRAME ACCESS LOG (REDACTED)^^" +
                            "00:14 AUTH FAIL  USER=?  SRC=TERM-12^^" +
                            "00:16 SESSION OPEN USER=@ SRC=TERM-12^^" +
                            "00:17 ACL CHANGE  SCOPE=SCI_DIV  AUTH=EXEC^^" +
                            "00:21 PROCESS SPAWN MCP.SUBSYS  PERM=ELEV^^";
                    }
                    else if(fn == "SESSION00LOG" && currentPath == "LOGS")
                    {
                        gladosMessage =
                            "^^SESSION00LOG^^" +
                            "SESSION TRACE (ABBREV)^^" +
                            "CMD: DIR (ROOT)^^" +
                            "CMD: CD PROJECTS^^" +
                            "EVENT: ACCESS DENIED (PROJECTS/MCP)^^" +
                            "NOTE: POLICY TAGGED 'EXEC-SEC'.^^";
                    }
                    else if(fn == "PRIVESCALATIONLOG" && currentPath == "LOGS")
                    {
                        gladosMessage =
                            "^^PRIVESCALATIONLOG^^" +
                            "ALERT: PRIVILEGE REWRITE ATTEMPT^^" +
                            "TARGET: SCI_DIV TOOLCHAIN^^" +
                            "SOURCE: MCP.SUBSYS^^" +
                            "RESULT: PARTIAL (OPS OVERRIDE APPLIED)^^";
                    }
                    else if(fn == "LASERBAYLOG" && currentPath == "LOGS")
                    {
                        gladosMessage =
                            "^^LASERBAYLOG^^" +
                            "LASER BAY SCHEDULE / ACCESS (ABBREV)^^" +
                            "WINDOW GRANTED: 02:00-02:30^^" +
                            "WINDOW REVOKED: 02:31 (EXEC SECURITY)^^" +
                            "NOTE: DIGITIZATION TRIALS INTERRUPTED.^^";
                    }
                    else if(fn == "MCPMONITORLOG" && currentPath == "LOGS")
                    {
                        gladosMessage =
                            "^^MCPMONITORLOG^^" +
                            "MCP MONITOR (ABBREV)^^" +
                            "UTILIZATION: 99%+^^" +
                            "PARTITION CLAIMS: INCREASING^^" +
                            "POLICY DIRECTIVES: ACTIVE^^";
                    }

                    // -----------------------------
                    // MAIL
                    // -----------------------------
                    else if(fn == "INBOX001EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX001EML^^" +
                            "FROM: E. DILLINGER^^" +
                            "TO: SYSTEMS-OPS^^" +
                            "SUBJ: MCP INTEGRATION^^" +
                            "BODY: PUSH MCP BUILD TO PRODUCTION AFTER HOURS.^^" +
                            "      ROUTE EXCEPTIONS THROUGH EXEC SECURITY.^^";
                    }
                    else if(fn == "INBOX002EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX002EML^^" +
                            "FROM: SECURITY^^" +
                            "TO: ALL TECH STAFF^^" +
                            "SUBJ: UNAUTHORIZED TERMINAL ACTIVITY^^" +
                            "BODY: SESSIONS ARE BEING LOGGED.^^" +
                            "      DO NOT ATTEMPT TO AUDIT MCP WITHOUT APPROVAL.^^";
                    }
                    else if(fn == "INBOX003EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX003EML^^" +
                            "FROM: OPS^^" +
                            "TO: SYSTEMS^^" +
                            "SUBJ: BACKUP ROTATION^^" +
                            "BODY: ARCHIVE TAPES MOVED OFFSITE. ACCESS RESTRICTED.^^";
                    }
                    else if(fn == "INBOX004EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX004EML^^" +
                            "FROM: ALAN BRADLEY^^" +
                            "TO: EXEC OVERSIGHT^^" +
                            "SUBJ: TRON SECURITY DEPLOYMENT REQUEST^^" +
                            "BODY: TRON IS READY FOR CONTROLLED DEPLOYMENT.^^" +
                            "      REQUEST APPROVAL BEFORE MCP LOCKDOWN EXPANDS.^^";
                    }
                    else if(fn == "INBOX005EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX005EML^^" +
                            "FROM: DR. GIBBS^^" +
                            "TO: DR. BAINES^^" +
                            "SUBJ: LASER WINDOW^^" +
                            "BODY: WE HAVE LIMITED TIME ON THE LASER BAY.^^" +
                            "      RECORD RESULTS OFFLINE UNTIL ACCESS STABILIZES.^^";
                    }
                    else if(fn == "INBOX006EML" && currentPath == "MAIL")
                    {
                        gladosMessage =
                            "^^INBOX006EML^^" +
                            "FROM: EXEC-SECURITY^^" +
                            "TO: SCI_DIV, SYSTEMS^^" +
                            "SUBJ: PARTITION POLICY UPDATE^^" +
                            "BODY: SCI DIVISION PARTITIONS NOW REQUIRE EXEC APPROVAL.^^" +
                            "      NONSTANDARD PROCESSES WILL BE TERMINATED WITHOUT NOTICE.^^";
                    }
                    else
                    {
                        gladosMessage = "^^ERROR 24 [File '" + fn + "' not found]";
                    }
                    break;
        // --------------------------------------------------------------------

        case "RUN":
            if(parts.length < 2)
            {
                gladosMessage = "^^ERROR 02 [Command requires a parameter]";
                break;
            }

            var prog = parts[1].toUpperCase();

            if(prog == "MCP")
            {
                if(currentUser == "DILLINGER") {
                    // External MCP grid (no terminal overlap)
                    openMCPPage();
                    gladosMessage = "^^MCP LAUNCHED IN EXTERNAL CONSOLE^^";
                    break;
                } else {
                    gladosMessage = "^^Access Denied. You are not the owner.^^";
                    break;
                }
                
            }

            gladosMessage = "^^ERROR 24 [Program '" + prog + "' not found]";
            break;

        case "PLAY":
            if(parts.length == 1)
            {
                gladosMessage = "^^ERROR 03 [What would you like to play?]";
            }
            else if(parts[1].toUpperCase() == "PORTAL")
            {
                playPortal();
                return undefined;
            }
            else if(parts[1].toUpperCase() == "SECURITY")
            {
                entryMode = 4;
            }
            break;

        case "HOME":
            home();
            return undefined;

        case "LOGOUT":
        case "BYE":
        case "LOGOFF":
            logout();
            return undefined;

        default:
            gladosMessage = "^^ERROR 24 [Unknown command]";
    }

    switchPage();
}


// =============================================================================
// 7) Data & globals (organized)
// =============================================================================

var cjhistory = new Array();
cjhistory[1] = new Object();
cjhistory[1].question = "ENCOM LOG ARCHIVE^^1979 - INTERNAL R&D EXPANSION^^1981 - GRID CONCEPT PROPOSED^^^[MORE]";
cjhistory[2] = new Object();
cjhistory[2].question = "1982 - MCP DEVELOPMENT BRANCH CREATED^^AUTHOR: DILLINGER^^^[MORE]";
cjhistory[3] = new Object();
cjhistory[3].question = "1982 - SECURITY INCIDENTS RISE^^EXTERNAL PROBES DETECTED^^^[MORE]";
cjhistory[4] = new Object();
cjhistory[4].question = "STATUS: ONGOING^^^[END]";

var gladosHeader = "ENCOM OS v3.2 (c) 1982 ENCOM, Inc.";
var gladosPrompt = " ^^ENCOM:\\\\> ";
var gladosMessage = "";
var gladosSpeed = 7;

var notesPage = 0;
var maxNotesPage = 4;
var notesCursor = false;

var theclip = _this;
var charIndex = 0;
var charMaxIndex = 0;
var keyLock = true;

var entryMode = 0;   // 0=login, 1=shell, 3=bosskey, 4=security feed, 5=notes
var pageOffset = 0;

theclip.loadVariables("gdxt.php?what=getid&refid=" + _level0.refid);

var applyAIDNum = 0;
var applyAIDText = 0;

var pauseReady = false;
var pauseLength = 500;
var pauseReturnState = 0;
var pauseCounter = 0;
var pauseFunction;

var snd = new Sound();

var waitVisStart = 0;
var waitVisTotal = 0;

var hint;
var hintOn = true;
var hintScale = 100;
var hintStep = 5;
var hintMessage = "thecakeisalie";
var hintOffset = 0;
var hintMax = 100;
var hintMin = 50;

var cursor;
var cursorBlink = true;
var cursorBaseX = 0;
var cursorAdjustY = 0;

var extraBlinker;
var extraBlinkerOn = false;
var extraBlinkerReady = false;

var format = new TextFormat();
format.font = "Courier New";
format.size = 12;

var cakeimg1 = _this.attachMovie("cake1", "caker1", _this.getNextHighestDepth(), {_visible:false});
var cakeRandom = 6000;
initCake(_this);

var inputer = _this.attachMovie("letter", "input1", _this.getNextHighestDepth());
inputer.field.text = "";
inputer._x = 10;
inputer._y = 550;


// =============================================================================
// 8) Login banners (qar) + delays (qdelay)
// =============================================================================

var qar = new Array();
qar[0] = "> ";
qar[1] = "Username> ";
qar[2] = "Password> ";
qar[3] = "ERROR 07 [Incorrect Password]^^Password> ";

qar[4] =
  " _____ _   _  ____ ___  __  __" +
  "                                                              " +
  "| ____| \\ | |/ ___/ _ \\|  \\/  |" +
  "                                                              " +
  "|  _| |  \\| | |  | | | | |\\/| |" +
  "                                                              " +
  "| |___| |\\  | |__| |_| | |  | |" +
  "                                                              " +
  "|_____|_| \\_|\\____\\___/|_|  |_|^^" +
  "^^ENCOM SYSTEMS SERVER ARCHIVE v1982.MCPDEV-001" +
  "^^Property of Encom (c) 1982" +
  "^^" +
  "^^> ";

qar[5] = "";
qar[6] = "";
qar[7] = "";
qar[8] = "";

var qdelay = new Array();
qdelay[0] = 75;
qdelay[1] = 75;
qdelay[2] = 75;
qdelay[3] = 25;
qdelay[4] = 5;

var qon = 0;


// =============================================================================
// 9) Video + key handling
// =============================================================================

var glob_nc = new NetConnection();
glob_nc.connect(null);

var glob_ns = new NetStream(glob_nc);
glob_ns.onStatus = function(infoObject)
{
    if(infoObject.code == "NetStream.Play.Stop")
    {
        glob_ns.play("security02.flv");
    }
};

var keyListener = new Object();
keyListener.onKeyDown = function()
{
    if(keyLock) { return undefined; }

    var code = Key.getCode();

    if((code < 48 || code > 90) && !(code == 8 || code == 13 || code == 37 || code == 32 || code == 34 || code == 33 || code == 191))
    {
        return undefined;
    }

    if(code == 191) { code = 63; }
    if(notesCursor) { code = 13; }

    switch(entryMode)
    {
        case 3:
            entryMode = 4;
            var char;
            var i = 1;
            while(i <= charIndex)
            {
                char = eval("char" + i);
                char.field.backgroundColor = 0;
                char.field.background = false;
                char.field.textColor = 6749952;
                i++;
            }
            switchPage();
            return undefined;

        case 4:
            entryMode = 3;
            glob_ns.seek(0);
            glob_ns.pause();
            glob_vid._visible = false;
            switchPage();
            return undefined;

        default:
            switch(code)
            {
                case 13:
                    var fnc = eval("processInput" + entryMode);
                    fnc();
                    break;

                case 37:
                case 8:
                    if(inputer.field.length > 0)
                    {
                        inputer.field.text = inputer.field.text.substr(0, inputer.field.length - 1);
                    }
                    break;

                default:
                    if(inputer.field.text.length < 65)
                    {
                        inputer.field.text = inputer.field.text + chr(code);
                        break;
                    }
            }

            cursorSetPos(
                cursorBaseX + format.getTextExtent(inputer.field.text).textFieldWidth,
                inputer._y - cursorAdjustY
            );
    }
};

Key.addListener(keyListener);


// =============================================================================
// 10) Boot
// =============================================================================

initCursor(_this, format);
placeText(_this, 0, 50, qar[4], format, qdelay[4]);
