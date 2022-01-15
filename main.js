// TEST YOUR (TTY) MIGHT: DOOM FIRE! 
// (c) 2022 const*void

import { stdout } from 'process';

//
// copy+paste code as it helps you.
//
// monolothic file by deaisn - no dependencies.
//

// For zig version, see:
// https://github.com/const-void/DOOM-fire-zig/

// TRM  //////////////////////////
// Terminal size
let sz=stdout.getWindowSize();
let term_col=sz[0];
let term_row=sz[1];

// TTY ///////////////////////////
//escape sequence
const esc='\u001b';

//xterm-256 color cache: foreground (fg) / background (bg)
const MAX_COLOR=255;
let fg=new Array(MAX_COLOR);
let bg=new Array(MAX_COLOR);
for (let c=0; c<=MAX_COLOR; c++) {
  fg[c]=`${esc}[38;5;${c}m`;
  bg[c]=`${esc}[48;5;${c}m`;
}

//cursor codes
let cursor_show=`${esc}[?25h`;  //h=high
let cursor_hide=`${esc}[?25l`;  //l=low
let cursor_home=`${esc}[1;1H`;  //1,1

let screen_buf_on=`${esc}[1049h`;  //h=high
let screen_buf_off=`${esc}[1049l`; //l=low

// FIRE ////////////////////////
const FIRE_H=term_row*2;
const FIRE_W=term_col;
const FIRE_SZ=FIRE_H*FIRE_W;
const FIRE_LAST_ROW=(FIRE_H-1)*FIRE_W;

let screen_buf=[FIRE_SZ-1];
let fire_pallette=[0,233,234,52,53,88,89,94,95,96,130,131,132,133,172,214,215,220,220,221,3,226,227,230,231,7];
let fire_black=0;
let fire_white=fire_pallette.length-1;

// start w/black screen
for (let i=0; i < FIRE_SZ; i++) {
  screen_buf[i]=fire_black;
}

// last row is "white" - fire feeder
for (let i=0; i<FIRE_W; i++) {
  screen_buf[FIRE_LAST_ROW+i]=fire_white;
}

let spread_px=0;
let spread_rnd_idx=0;
let spread_dst=0;
function spreadFire(px_idx) {
  spread_px = screen_buf[px_idx];
  if (spread_px==0) {
    screen_buf[px_idx-FIRE_W]=0;
  }
  else {
    spread_rnd_idx=Math.round(Math.random() * 3.0);// & 3;
    spread_dst=px_idx-spread_rnd_idx+1;
    screen_buf[spread_dst-FIRE_W]=spread_px - (spread_rnd_idx & 1);
  }
}

//scope cache (thread unsafe)
let doFire_x=0;
let doFire_y=0;
function doFire() {
  for (doFire_x=0; doFire_x<FIRE_W; doFire_x++) {
    for (doFire_y=0; doFire_y<FIRE_H; doFire_y++) {
      spreadFire(doFire_y*FIRE_W+doFire_x);
    }
  }
}

// c/o https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function fmtKB(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

//scope cache (thread unsafe)
//let last_sz=0;
let init_s=cursor_home+bg[0]+fg[0];
let frame_x=0;
let frame_y=0;
let px_hi=0;
let px_lo=0;
let px_prev_hi=0;
let px_prev_lo=0;
let s=init_s;
let s_len=s.length;
let s_sz_min=0;
let s_sz_max=0;
let s_sz_avg=0;
let s_frame_tic=0;
let time_start=Date.now();
let time_now=Date.now();
let time_pass=time_now-time_start;
  
function drawFrame() {
  doFire();
  //scope cache reset
  px_hi=0;
  px_lo=0;
  px_prev_hi=0;
  px_prev_lo=0;
  s=init_s;  

  for (frame_y=0; frame_y<FIRE_H; frame_y=frame_y+2) {
    for (frame_x=0; frame_x<FIRE_W; frame_x++) { 
        px_hi=screen_buf[frame_y*FIRE_W+frame_x];
        px_lo=screen_buf[(frame_y+1)*FIRE_W+frame_x];
        if (px_lo!=px_prev_lo) {
          s+=bg[fire_pallette[px_lo]];
        }
        if (px_hi!=px_prev_hi) {
          s+=fg[fire_pallette[px_hi]];
        }
        s+='▀';
        px_prev_hi=px_hi;
        px_prev_lo=px_lo; 
    }
  }

  stdout.write(s);
  time_now=Date.now();
  s_len=s.length;
  s_frame_tic++;
  if (s_sz_min==0) {
    s_sz_min=s_len;
    s_sz_max=s_len;
    s_sz_avg=s_len;
  }
  else {
    if (s_len < s_sz_min) { s_sz_min=s_len; }
    if (s_len > s_sz_max) { s_sz_max=s_len; }
    s_sz_avg=s_sz_avg*(s_frame_tic-1)/s_frame_tic+s_len/s_frame_tic;
  }
  time_pass=(time_now-time_start)/1000;

  //some stats
  stdout.write(`${fg[0]} mem: ${fmtKB(s_sz_min)} min / ${fmtKB(s_sz_avg)} avg / ${fmtKB(s_sz_max)} max [ ${(s_frame_tic/time_pass).toFixed(2)} fps ] ${s_frame_tic}`)
 
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

// MAIN ///////////////////////
// term prep
stdout.write(screen_buf_on);
stdout.write(cursor_hide);

let ok=true;
time_start=Date.now();
while(ok) {
  drawFrame();
}

