## 如何做一个2D 横版过关类游戏

好多人学编程的初衷都是对电子游戏的热爱，以及想做自己的电子游戏，从而学习了计算机专业。然而随学习大多发现自己并没有做电子游戏方面的进步。这个教程在这里给仍对游戏编程执念的同学一点启发，给曾经想做电子游戏的同学一点 “原来如此” 的回味。

不可否认，电子游戏的主题是电子艺术。而电子游戏编成只是给电子艺术表现的平台。本文意在介绍2D电子游戏编程的原理和程序设计方向，不在艺术方面讨论。作者本人并没有专业游戏开发经验。只是凭编程直觉和出自对电子游戏的个人理解。本文以制作超级玛丽洛克人一类游戏为主题。

### 游戏循环 (game loop)

在回合制游戏, RPG游戏往往不需要游戏循环。简单的游戏设计，游戏过程主要靠用户的指令来进行，甚至可以在没有用户输入的情况不更新画面。即时的游戏常常需要一个游戏循环函数 `gameLoop()`。如果把一个游戏看作一部动画的话，每次这个函数被呼叫都会更新画面一帧。在固定时间间断被重复呼叫，就形成了动态的游戏。这个函数同时也会处理用户输入：比如控制角色移动跳跃。以及更新游戏里的敌人和其他角色的动态。

如果你用的引擎没有提供游戏循环的话，你可以自己把游戏循环函数绑定在时钟上。

### 图像引擎

一个2D动画游戏的画面基本上由一个个方块图片。组成通过移动图片，切换帧实现动画效果。

#### 画方块图

图像引擎基本需要:
- 能够贴图
- 能够把一组图放在同一个坐标系里。通过移动坐标系移动所有的图
- 画图片有前后顺序 (zIndex)

这里我用了 Pixi.js https://www.pixijs.com/ 这个引擎提供了画图功能。

### 物理引擎

为了让图像能动起来，最简单的方法就是给你的图设置一个速度 (dx, dy) 每次游戏循环时调整它的位置 (x,y)
 ```
 x = x + dx;
 y = y + dy;
 ```
这样你的图片就移动起来。然而这种移动应该叫作“飞”， 因为他是不受引力限制的。为了允许某些物体坠落，可以给图设置一个加速度。(gravityX, gravityY)
```
 dx = dx + gravityX;
 dy = dy + gravityY;
```
如果`dx`为正值人物在地上走。

#### 什么是跳跃？
设速度`dy`为负值, 人物在跳。但最终会因引力回到地面。

#### 什么是飞行?
设引力`gravityY=0`, 人物不受引力, 在飞。

### 碰撞
简单的设计：每个人物或物件都是一个长方形。当长方形交叉，程序判定物件碰撞。
你可以用碰撞引擎。但碰撞的逻辑很简单：
- 两个长方形`R1`和`R2`:
- 如果`R1`完全在`R2`的右边
- 或者`R2`完全在`R1`的右边
- 或者`R2`完全在`R1`的上面
- 或者`R2`完全在`R1`的上面
- 则两个长方形碰撞。
- 否则，没有碰撞

举例：
```
function rectSeperatedOnX(r1, r2) {
  return r1.x > r2.x + r2.width || r2.x > r1.x + r1.width
}
function rectSeperatedOnY(r1, r2) {
  return r1.y > r2.y + r2.height || r2.y > r1.y + r1.height
}

function hitRectangle(r1, r2) {
  return !rectSeperatedOnX(r1, r2) && !rectSeperatedOnY(r1, r2);
}
```

#### 什么是着陆？
当一个人物在腾空过程中，脚底前一帧和后一帧的距离，形成一个长方形。如果这个长方形碰到可立足的长方形（例如地面），则判定站立。
- 站立以后和地面`y`对齐，设置`dy=0` 不再`gravityY`更新人物的下降速度。
- 记住这个地面长方形，以便走到地面边缘处回到下落（跳跃)状态
- 跳跃时切断地面长方形关联。再度继续更新人物的`y`。

#### 什么是顶住？
当一个人物在上升过程中头顶前一帧和后一帧的距离, 形成一个长方形。如果这个长方形碰到可站立的长方形（例如地面），则判定顶住。
- 顶住以后设置人物的`dy=0`对齐，不再更新人物的`y`。

#### 移动平台
移动平台可以是一个移动的(每一帧更新位置)可以立足的方块人物。
- 人物着陆在移动平台后, 平台的垂直位置`y`决定人物的垂直位置`y`
- 人物水平位置更新`x = x + dx + platform.dx` 由人物速度和平台速度决定

### 攻击

#### 血量 (HP)

最基本的，每个人都有血量 HP。当血量为零时，人物控制被程序删除，并触发死亡事件(event)
`hp = hp - attackPoint`
有兴趣可以设定更高级的血量加减判定，这里不多讲。

#### 什么是攻击？
- 每个人物本身定义一个挨打长方形。
- 人物根据目前的方向，释放出一个和其他人物碰撞的一个攻击判定长方形，
- 当攻击判定长方形碰撞挨打长方形, 打击判定成立, 相应减HP，显示挨打动画

#### 什么是开枪？
- 人物必须有一个枪口，并这枪口有一定方向和子弹初速度
- 子弹一个独立人物出现, 有攻击判定的长方形。例如：一个飞行的火球
- 当攻击判定达成, 火球可以穿透继续伤害，或者消失不再继续碰撞，或者衍生其他火球

### 状态机 (state machine)

#### 动画精灵图 (sprite)

精灵动画也叫逐帧动画, 每一帧更换一个画面. 在电子游戏里面也一样，动画由一系列图组成.
因为帧数多于图数，每张图可能是很多帧(ticks)。每一张图在帧数耗尽后换下一张图. 例如人物的立定和走动:

```
[{state:'立定',
  ticks:6000},
{state:'跳跃',
  ticks:6000},
{state:'走步左脚',
  ticks:8,
  nextState:'走步右脚'},
{state:'走步右脚',
  ticks:8,
  nextState:'走步左脚'}]
```
`走步左脚`8帧以后换成 `走步右脚`, 再8帧以后换成`走步左脚` 以此循环。

#### 为什么用状态机?
然而，在电子游戏里面，动画不完全是线性的。状态可以没有变化, 比如`立定`. 也可以根据用户输入改变状态, 比如当用户按键时从`立定`变成``走步左脚` 并且增加速度, 因此状态应该储存更多相关数据. 例如:
```
[{state:'立定',
  ticks:6000,
  dx:0, dy:0},
{state:'跳跃',
  ticks:6000,
  dy: -60},
{state:'走步左脚',
  ticks:8,
  nextState:'走步右脚'
  dx: 2},
{state:'走步右脚',
  ticks:8,
  nextState:'走步左脚',
  dx: 2}]
```

状态可以进行攻击判定，例如: 发射火球, 要定义进而枪口的位置和火球的速度攻击范围, 火球碰到敌人进而产生火花.
```
[{state:'立定',
  ticks:6000,
  dx:0, dy:0},
  ... ,
  {state: '开火',
   '创建动物': [{
      name: '火球',
      imgUrls: ['./火球.png'],
      x: 5, y: 5,
      dx: 4, dy: 0,
      gravityX: 0, gravityY: 0,
      '攻击判定': {width: 10, height: 10, '减血': 1},
      onHit: {
        '创建动物': [{
          name: '火花',
          imgUrls: ['./火花.png'],
          x: 0, y: 0,
          dx: 0, dy: 0,
          gravityX: 0, gravityY: 0,
          states: [{
            state:'火花初始',
            ticks: 10,
            imgUrls: ['./火花1.png'],
            nextState: '火花爆开',
            x: 0, y: 0,
          }, {
            state:'火花爆开',
            imgUrls: ['./火花2.png'],
            ticks: 10,
            x: 0, y: 0,
          }]
        }]
      }
     }]
  }
```

##### 更复杂的状态机
更复杂的状态机，可以用来编辑关底Boss的行动序列, 不同小兵的攻击方式, 人物被攻击虚影的无敌时间，等等.

### 房间转变
由于上个世纪的电脑硬件局限，以前的游戏往往不能一次全部搬进内存。做一个大的地图往往需要分成不同房间。每个房间都有自己的场景、敌人的设置。人物走到房间边缘时，会切换到另一个房间。（如果仔细观察的话，洛克人、恶魔城在切换房间的过程敌人会全部消失，大概就是这个原因）

把地图分割成房间的另一个好处是地图编辑器可以编绘更简单的房间，方便测试。

每一个房间在边缘会有另一个房间的定义。例如
```
const stages = {
  "房间1": {
    "站立平台": [ ... ],
    "背景图": [ ... ],
    "敌人": [ ... ],
    "房间链接": {
      "右": "房间2",
      "下": "gameOver",
    }
  },
  "房间2": {
    "站立平台": [ ... ],
    ...
```