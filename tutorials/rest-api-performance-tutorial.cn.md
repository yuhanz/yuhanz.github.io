# 优化服务器性能: 如何做一个快捷的服务API
- 作者：[张宇瀚](http://yuhanz.github.io/)  2021年1月16日

程序员经过几年工作，都基本掌握了些编程技能。然而服务器上往往会运行很多不同人写的程序，程序的质量良莠不齐。能在运营中发现性能问题解决问题，保证一个快速的服务 API，这点甚至比写优质的程序本身更加重要。这篇文章主旨于介绍发现性能问题的方法。

优化的过程**不在于**使用某种新科技新构架或某种快捷的语言。优化的过程在于：发现问题，理解问题，处理问题。所有优化都必须通过测量来确保其效果。

## 为什么要服务API?
  为前端工程师提供数据，方便团队开发。种种原因在此不罗列。

### 为什么要Micro Service微服务?
- 把数据库分开和微服务联系起来，变成简单的API。方便更新，出错了方便分析。
- 由于直接和数据库相连速度很快(小于1微秒)，微服务通常不需要多线程。

### 为什么要Backend For Frontend（服务于前端的后端)?
- Backend For Frontend 把多个微服务数据联系到一起。方便前端使用，减少前端需要呼叫后端的次数。或者多种数据进行需要的计算。
- 通常需要多线程或非阻塞同时呼叫多个微服务。

## 什么是快捷的服务API ?

  服务器响应速度通常在NginX访问记录里出现(Access log)。服务 API响应速度直接影响网页的速度，测量服务器用平均响应微秒数作标准通常是不够的。常用测量的是99%的访问速度。这个值代表了最差用户体验。作为服务器的速度底线。
  - 为什么不用最大时间测量?
    - 通常会有误差和种种不可控制的网络问题。去掉最慢 1%甚至 0.1%，相当于体操比赛评分去掉一个最低分。让统计数据更可靠，而不拘泥于一些无法控制的问题。
  - 为什么不用平均时间测量?
    - 平均值会因为个别事件跳动偏大。当平均值差太多，服务本身已经坏得不可救药。
  - 为什么不用中间值时间测量?
    - 标准太低。问题难以及时被发现。

  - upstream_response 和 request_time 的区别
    - upstream_response: 服务 API响应第一个字节需要的时间。也就是说服务器已经完成逻辑开始传输了。通常这适合测量程序本身是否快。
    - request_time: 服务器响应并彻底完成传输的时间。这里测量的包括网络传输的速度。直接测量用户体验。注意如果用户的网速慢或者电脑慢也会影响这个速度。

### 一般应该有多快才算快？
- micro service 微服务: 在 10ms以内 （微秒）
- 数据库响应速度: 小于 1ms （微秒）
- Backend For Frontend （服务于前端的后端): 小于 200ms（微秒）
- 写操作: 一秒以内

## 测量快不快的方法
- print - 相信大家在某种阶段都用过这种在程序里加 print的方法测量。由于 stdout输出本身会带慢程序。通常在程序里做测量会测不准。
- NginX log 服务器访问记录 - 服务器响应速度的用户体验都在这里了。快慢最终标准。
- Profiler 分析器 - 例如 VisualVM或 YourKit 可以直接在本地（或者远程通过JMX连接）测量Java程序。可以自动告诉你哪个函数累积的时间最多，通常会是最慢的部分。
- StatsD - 通过 UDP 传输测量值的。开发者根据需要在程序里加测量值。由于UDP 没有连接过程，StatsD并不会造成减速或因为出错而干扰正常逻辑运行。收集到的数据后可实时通过 Graphite 或 Grafana 做图表来看 99%的速度
- APM (application performance monitoring) - 利用在程序里加代理模块，通常会采集到第三方的服务器。(例如newrelic, AppDynamics) 服务价格较贵。
- DB slow log 数据库慢记录 - 通常数据库会有记录很慢访问的功能。这样不用有程序也能知道那些查询造成了减速。

## 怎么才能快？

对一般的网站来说，大多是只是数据读写操作，没有过多复杂算法的。所以不需要很多CPU资源。所以对这种程序我们一般假设**只要服务器没有用尽任何资源就会无穷快**。这里的资源包括CPU，内存，网络带宽。等等。

## 程序用尽内存会怎样？
对于C/C++程序来说，通常意味着程序退出。对于虚拟机（例如Java），这种情况通常有两种:
1. 程序的内存上限大于真正的内存，这时程序向系统索要内存得不到，会因此出错退出。这种情况通常可以给程序设一个内存上限来避免。
2. 程序的内存上限小于真正的内存，保障上一种情况不会发生。这时程序虚拟机会触发GC事件(清理垃圾)从而释放可以重复使用的内存。**这时会造成高CPU，延缓程序速度。**
  - 多个 CPU对 GC事件(清理垃圾)比单个 CPU 有帮助。

### 为什么会用尽内存？
- 一切正常的情况，同时访问的的用户太多了，每个用户访问占一部分内存，可能用尽了内存。
  - 因为线程类服务器程序, 每个线程都要占用很多内存。例如 Tomcat默认限定 200个线程。用非阻塞 nonblocking 类服务器程序(例如 NodeJS, Spring Boot)可以脱离用户占用线程的限制。从而允许更多用户同时访问。
  - 用非阻塞一定就不会慢吗？
    - 并不一定。其他情况仍有可能带慢程序。
- 程序本身可能有内存泄漏:
  - 这种情况程序的内存尺寸记录会告诉你内存在不停减少。GC事件(清理垃圾)也会不到原来的大小。这时就要注意了。
  - 约束内存缓存: 在使用缓存时，应该给缓存在本地的内存设个上限。防止让缓存填满内存。
    - 缓存用 soft reference能够保证，在没有内存的情况下，缓存会被 GC事件清空，为程序释放内存。
### 为什么 CPU 会慢？
  - CPU高 = 程序卡。（这个和玩电子游戏原因相同）
  - 同一台机器内会有很多不同程序。查一下是否其他程序占用 CPU 资源
  - GC事件时，程序会被锁住，方便虚拟机清理内存。所以内存不够或者大量反复申请／释放内存往往会造成服务器卡顿。GC事件算法本身很耗费CPU
    - 当内存全部用完GC事件无法释放时，100% CPU 会被用尽。这时服务器就会因为持续被访问再也动不了了。这种情况需要重启时，甚至需要加更多机器分流。 (这也经常是是为什么一片服务器会集体倒塌的原因，造成一台死机的服务器的访问量被分流到其他机器，大流量挤压其他机器造成连锁倒塌。)

### 读写硬盘会慢
- 因为硬盘读写慢，API服务器应该通过网络去数据库读数据。
- 当程序出错时，往往会在写出错记录时花费更多时间，带慢程序。开发者应该限制每次写出错记录的长度。

### Thread Pool 线程池用完了
- 当Tomcat 线程用完了，更多用户会阻塞在程序端口等线程。这时访问就变慢了。
- 其他线程池（Thread Pool）: 根据具体程序的设置，线程池可能被设置成用完就等待。
  - 线程池最好的设置是用完就出错。以保证开发人员知道自己没给够资源。

### Connection pool 连接池用完了
- 程序内做数据库访问，HTTP访问，通常会有客户端。客户端里会有连接池。连接池用完时，会造成阻塞等待连接的现象。因为消耗内存不多，连接池通常应该设置在远大于需要的范围。

### Network bandwidth 网络带宽用完了
- 你的服务器带宽用完了。访问阻塞在下载上。可能是因为你的服务器在传输很大的文件等等。
- 一个数据中心内网机器之间带宽是极大的，通常这种事不会发生。

### 连接到外网 Internet 变慢
- 内网 = 快; 外网 = 慢
- 由于外网经过多个路由器。难以预料速度。如果你的呼叫的服务器在 Internet外网，速度会变慢。

### 域名服务器变慢 (DNS resolve)
- 客户端呼叫 API 时往往不会直接用 IP 地址。为了清楚方便，API 服务会有自己的内部域名，内网会有自己的域名服务器解析 (DNS resolve)。当域名服务器变慢，会拖累 API一起变慢。

### 减少下载字节
很明显，下载几 kb 的文字要比下载几百 MB 的视频快。尽管内网服务器带宽很大，但也一样越短的传输越快。很多程序员由于懒惰，会把表格一整行不需要的数据一起读出来。传输不需要的数据造成了速度变慢。
 - 这是使用 ORM 经常会犯的错误。很多程序员假设 ORM 会帮他们避免下载不必要的数据。然而未设置的 ORM 通常会读取一整行。
 - API 应该使用 partial response 设计。减少不必要的数据。GraphQL 也是一个很好的选择。
- 压缩 (compression): 即时压缩会占用 CPU ，如果传输的数据很大时，压缩会有效减少下载字节。尤其是传输到外网时，压缩会大有帮助。
  - 一般服务器(例如 Tomcat)会提供自动压缩功能。不需要在程序里自行压缩。
  - 在服务器之间，通常是默认不压缩的。你的客户端 HTTP 呼叫时必须有标头 `Accept-Encoding: gzip` 一类的支持压缩选项，服务器才有可能给你压缩后的内容。根据情况客户端得到的数据可能是压缩的，也可能是没有压缩的。
  - 从用户浏览器发出的呼叫基本都会有 `Accept-Encoding: gzip` 的。会下载压缩内容。
### 减少 Http标头字节 (HTTP header)
  一般服务器会默认 Http标头字节 8kb 在以内。这部分内容是不能压缩的。所以注意减少不必要使用这部分，尤其是Cookie，常常会造成标头很长。

### 减少往返次数 (round-trip)
  虽然浏览器会平行下载，但平行线程往往会很有限。浏览器呼叫过多会造成平行线程用尽，从而造成排队下载，等待往返，使得变慢。总体而言，所有外网 Internet的呼叫因为速度不佳，往返一次时间长，都应该减少。优化方法：

  - 批量处理 (batch read/write): 如果网页多次读取你的 API根据 Id取记录，不妨用设计成一次呼叫申请多个ID。例如：&id=1,2,3
  - 多表连接(table join): 如果网页多次读取你的 API: 先取记录，再用取得的记录的一部分去取其他记录。这时你应该考虑设计一个微服务直接做数据库表连接。
    - 我用的是NoSQL怎么办？- 非规范化（Denormalization）

## 数据库怎么才能快？
  这里说的数据库笼统地包括数据库 SQL 和数据存储 NoSQL。

  正确地使用数据库本身应该是很快的。但对于数据存储的速度重要的取决于查询时(Query)是否用了正确的索引(Index)。如果没有索引，数据库不能做对分搜素，速度就会因做线性搜索而变慢。
  - 注意，数据库线性搜索由于耗费 CPU，有可能因为 100% CPU 造成其他查询一起变缓慢。

  数据库slow log可以侦测到缓慢的查询事件。可以使用 explain select，发现索引使用中的问题。

### 把数据全存在内存里！

  数据库在读盘时会最慢。尽管可以用固态硬盘(SSD)来弥补速度的不足，但如果能把所有数据读入内存自然是最佳方案。MongoDB , Redis都是可以用内存做全部存储的工具。

#### 把数据存在内存里不怕丢吗？
  - 使用复制(replication) 做多个拷贝。保证数据库不正常时可以有拷贝自动恢复。
  - 也可以把主要记录留在硬盘里，把内存数据存贮做缓存。

#### 我的数据太大了，内存放不下怎么办？
  Sharding 功能可以把不同记录分批写入多台机器。MongoDB, Cassandra 都是可以 根据 Sharding 储存记录的工具。

#### 为什么数据库写操作影响读操作变慢？
  这是由于写的过程数据库会给自己加锁，因而读操作必须等待写操作完成所导致缓慢。应选择在记录层加锁的数据库引擎，从而避免数据库全局锁或表格锁。
  - 如果数据存在硬盘里，选择固态硬盘(SSD)能够弥补一些速度的不足。
  - 通过 Sharding 进行分流在多机器写操作，也可以缓和写操作对机器的压力。
  - 批量写操作(batch write)提高写的效率，以减少冲击。

#### 数据库不明下情况变慢?
  数据库都有测量指标的记录(metrics)。具体问题根据指标(metrics)进行具体分析。

### 服务 API 常见的变慢原因

- 出错太多导致变慢
  - 出错记录(log)会做写硬盘操作。出错太多进而硬盘操作太多，造成服务变慢。

- 算法差导致变慢
  - 算法差造成100% CPU 用完
    - 如果 CPU 不到 100%一般是不会影响速度的。（例如 CPU 90% 并不会减慢服务速度）
  - 如果多加一个 CPU 管用吗？
    - 错误的算法会把很多 CPU 一起吃掉。往往多加一个 CPU 没用。
  - 优化算法
    - 用你在学校学过的，散列算法、哈希函数、对分搜索，避免线性搜索和递归调用。
- 缓存变数据库
  - 很多人有误解只要数据在内存里就会快，甚至把大量内存缓存当数据库用。这除了导致 GC 频繁以外，往往会因为程序对缓存中的数据进行线性搜索，而变慢。让服务 API 变成了一个没有正确的索引的数据库。在设计上应避免这个陷阱。
  - 原则：不要让服务 API 做数据库做的工作。

- 内存太大
  - 内存越大，的确GC 就越少发生。但同时 GC一旦发生，持续的时间也将会相应更长。

### 服务器怎么才能受得住大访问量？
- 快 = 多
  - 服务器越快承载的人才能越多。有点像高铁速度越快，同样的高铁资源，就能跑更多班次，从而运送更多客人一样。
- 设时限 (timeout)
  - 99%的人占用 1%的时间，1%的人占用 99%的时间。排队时遇到慢悠悠的人，如果能把此人踢出，则解放资源给更多人。API 服务设时限，能够确保一定多的人数得到资源。
- 减少内存需要
  - 非阻塞nonblocking 不需要等待线程 thread时占内存，从而更多人可以一起访问。
- 布局更多台服务器分流
  - 认输，砸钱。
  - 这应该是没有发现优化办法时的临时解决方法。

#### 如果我的 CPU没有用到 100%，可以少用几台机器吗？
  - 在以读写为主的服务来说，最佳的 CPU是 0%。CPU 并不能做分流指标。应该以内存指标为主。
  - 通过测量响应速度，决定每台机器能承担的流量。常见的模拟加压测量工具有httperf, JMeter等。然后依据性能决定布局几台机器分流。

### 结论

服务器优化就是一个让服务器少花钱、少出错、访问多、又不让它变慢的游戏。
