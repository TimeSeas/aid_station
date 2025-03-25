// / pages/knowledge/detail.js
Page({
  /* 页面数据容器 */
  data: {
    article: {},// 当前文章数据对象
    isFavorite: false// 收藏状态标识
  },
/* 页面加载生命周期 */
  onLoad(options) {
    const id = options.id;// 获取路由参数中的文章ID
    // 模拟数据获取（实际应从云数据库获取）
    const articles = [
      {
        id: 1,
        title: '流浪狗的生存挑战',
        date: '2023-10-01',
        summary: '全球约2亿只流浪狗面临哪些生存威胁...',
        coverImage: 'https://ts1.tc.mm.bing.net/th/id/R-C.3596ee937c0af4dccc4b5812ba2af24d?rik=gKNxx6RbbfsfvQ&riu=http%3a%2f%2f5b0988e595225.cdn.sohucs.com%2fimages%2f20191225%2ff4213d0a4b8e4d3cbb658b2d3d3e0133.jpeg&ehk=FgpSDhk%2fMmG3hkJoVYOXKivHDrnBSA2dcRe0FmhpZ8Y%3d&risl=&pid=ImgRaw&r=0',
        content: '<p style="text-indent:2em">流浪狗，这一特殊群体，常常被我们忽视，却面临着诸多生存困境。据不完全统计，我国流浪狗数量高达数千万只，它们在城市的角落、乡村的边缘艰难求生，生存环境令人揪心。</p>                                        <span><strong>食物短缺：饥饿的阴影</strong></span><p style="text-indent:2em">流浪狗没有稳定的食源，它们只能依靠垃圾堆中的残羹剩饭、好心人的投喂，甚至与其他动物争夺食物。在寒冷的冬天或炎热的夏季，食物短缺问题尤为突出，许多流浪狗因长期营养不良而身体虚弱，甚至饿死。</p>                                                   <span><strong>疾病威胁：健康的隐患</strong></span><p style="text-indent:2em">流浪狗缺乏基本的医疗保障，容易感染各种疾病，如狂犬病、细小病毒、犬瘟热等。这些疾病不仅威胁流浪狗的生命，还可能通过接触传播给人类和其他动物。由于缺乏治疗，许多流浪狗在患病后只能默默承受痛苦，最终因病死亡。</p>                                    <span><strong>环境恶劣：生存的困境</strong></span> <p style="text-indent:2em">流浪狗的栖息环境十分恶劣，它们没有温暖的家，只能在街头巷尾、废弃建筑中寻找遮蔽之所。在极端天气下，如暴雨、暴雪、酷暑，流浪狗的生存面临巨大挑战。许多流浪狗因长时间暴露在恶劣环境中，冻伤、中暑甚至死亡。</p>                                      <span><strong>人类威胁：误解与伤害</strong></span> <p style="text-indent:2em">流浪狗常常被误解为“危险动物”，遭遇人类的驱赶甚至暴力对待。一些地区对流浪狗的管理方式较为粗暴，如大规模捕捉后直接处死，这种做法不仅残忍，也未能从根本上解决问题。此外，流浪狗还可能因交通事故受伤或死亡，生命安全得不到保障。</p>'
      },
      {
        id: 2,
        title: '科学救助五步法',
        date: '2023-10-01',
        summary: '遇到流浪狗应该如何正确处理...',
        coverImage: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.9Q0s9V3ahtEena31HkNJygHaFj?rs=1&pid=ImgDetMain',
      
        content: '<p style="text-indent:2em">在街头巷尾，流浪狗的身影随处可见，它们或因被遗弃、或因走失而流落街头，面临着饥饿、疾病和危险。科学救助不仅能为这些无助的生命带来希望，还能有效减少流浪狗问题对社会的负面影响。以下是科学救助流浪狗的五步法，帮助你安全、高效地开展救助行动。</p>                                              <span><strong>第一步：观察与评估</strong></span><p style="text-indent:2em">在发现流浪狗后，不要急于靠近，先观察它的状态： </p> <ul><li><strong>健康状况：</strong>是否有外伤、流血、跛行或精神萎靡的迹象。</li><li><strong>行为表现：</strong>是否表现出攻击性、恐惧或极度饥饿。</li><li><strong>环境因素:</strong>是否处于交通要道、恶劣天气或危险区域。</li></ul><p style="text-indent:2em"> 观察后，根据狗狗的状态决定下一步行动。如果狗狗受伤严重或处于危险环境中，需尽快联系专业救助机构或兽医。 </p>                                                                <span><strong>第二步：安全捕捉</strong></span><p style="text-indent:2em">捕捉流浪狗需要谨慎操作，确保人狗安全：</p> <ul><li><strong>使用工具：</strong>准备捕捉网、笼子或牵引绳，避免直接用手捕捉。</li><li><strong>吸引注意力：</strong>用食物（如火腿肠、狗粮）吸引狗狗靠近，然后迅速将其引入笼子或套上牵引绳。</li><li><strong>避免冲突：</strong>如果狗狗表现出攻击性，不要强行捕捉，可等待其平静后再尝试，或联系专业人员协助。</li></ul><p style="text-indent:2em"> 捕捉时动作要轻柔，避免对狗狗造成二次伤害。 </p>                                                           <span><strong>第三步：初步检查与护理</strong></span><p style="text-indent:2em">将流浪狗安全带回后，进行初步检查和护理： </p> <ul><li><strong>检查伤口：</strong>查看是否有外伤、寄生虫或感染迹象，及时清理伤口并消毒。</li><li><strong>提供食物和水：</strong>给予适量的温水和易消化的食物，避免过量进食导致肠胃问题。</li><li><strong>保暖措施：</strong>为狗狗提供温暖、干燥的环境，避免其受凉。</li></ul><p style="text-indent:2em"> 如果狗狗伤口严重或出现呕吐、腹泻等症状，需尽快送医。 </p>                                                                  <span><strong>第四步：联系救助机构或寻找领养</strong></span><p style="text-indent:2em">救助流浪狗需要长期的精力和资源投入，因此建议联系专业的救助机构： </p> <ul><li><strong>联系救助站：</strong>将流浪狗送往当地的动物救助站或收容所，让专业人员继续照顾。</li><li><strong>寻找领养：</strong>通过社交媒体、宠物领养平台发布流浪狗的信息，帮助它找到合适的领养家庭。</li><li><strong>绝育手术：</strong>建议为流浪狗进行绝育手术，避免其繁殖后代，进一步加剧流浪狗问题。</li></ul><p style="text-indent:2em"> 在发布领养信息时，详细描述狗狗的品种、性格、健康状况等，增加领养成功率。 </p>                                                   <span><strong>第五步：持续关注与回访</strong></span><p style="text-indent:2em">救助流浪狗并非一送了之，持续关注是确保它们幸福生活的重要环节：</p> <ul><li><strong>回访领养家庭：</strong>是否有外伤、流血、跛行或精神萎靡的迹象。</li><li><strong>参与救助行动：</strong>是否表现出攻击性、恐惧或极度饥饿。</li><li><strong>宣传倡导：</strong>通过自身行动，呼吁更多人关注流浪狗问题，倡导文明养犬，减少遗弃行为。</li></ul><p style="text-indent:2em"> 关注流浪狗的长期幸福，是救助行动的最终目标。 </p>        '
      },
      {
        id: 3,
        title: '从选择品种到迎接新家',
        date: '2023-10-01',
        coverImage: 'https://n.sinaimg.cn/sinakd10109/217/w640h377/20220610/3802-597843381edffa1507b21138861338c1.png',
        summary: '详细介绍领养狗狗的全流程，从品种选择到新家布置...',
        content: '<p style="text-indent:2em">领养狗狗是件幸福的事，但需要做好准备。以下是从选择品种到迎接新家的简单指南，轻松开启养狗之旅。</p>                                                                <span><strong>第一步：选对品种</strong></span><p style="text-indent:2em">根据生活方式选品种：</p> <ul><li><strong>活泼型：</strong>喜欢运动，适合户外活动多的家庭。</li><li><strong>安静型：</strong>性格温和，适合公寓生活。</li><li><strong>低维护：</strong>短毛犬，适合忙碌的主人。</li></ul>                                          <span><strong>第二步：备齐用品</strong></span><p style="text-indent:2em">狗狗到家前，准备好以下物品：</p> <ul><li><strong>生活用品：</strong>狗粮、狗窝、食盆、牵引绳。</li><li><strong>安全环境：</strong>检查家中，避免危险物品。</li></ul>                                                                  <span><strong>第三步：初次见面</strong></span><p style="text-indent:2em">狗狗到家后，让它慢慢适应： </p> <ul><li><strong>安静空间：</strong>给它一个安静角落。</li><li><strong>温和接触：</strong>不要强迫亲近，让它熟悉你。</li></ul>                                                                  <span><strong>第四步：健康检查</strong></span><p style="text-indent:2em">领养后，带狗狗去宠物医院： </p> <ul><li><strong>全面检查：</strong>确保健康。</li><li><strong>疫苗驱虫：</strong>按时接种，定期驱虫。</li></ul>                                                               <span><strong>第五步：陪伴训练</strong></span><p style="text-indent:2em">多陪伴，简单训练，让狗狗融入家庭：</p> <ul><li><strong>基本指令：</strong>教它“坐下”“握手”。</li><li><strong>规律作息：</strong>按时喂食、遛狗。</li></ul>          <span><strong>结语</strong></span><p style="text-indent:2em"> 做好准备，迎接新伙伴，开启美好养狗生活。</p>        '
      },
      {
        id: 4,
        title: '被遗弃的流浪狗',
        date: '2023-10-01',
        coverImage: 'https://img95.699pic.com/photo/60046/7415.jpg_wh860.jpg',
        summary: '流浪狗数量增长的原因...',
        content: '<p style="text-indent:2em">在城市的角落、乡村的路边，流浪狗的身影随处可见。它们或蜷缩在垃圾桶旁，或徘徊在街角，眼神中透露出无助与迷茫。然而，这些流浪狗中，有很大一部分曾是人类的宠物，却因种种原因被遗弃，从此踏上流浪之路。</p>                                                                   <span><strong>被遗弃的原因：无奈与冷漠</strong></span><p style="text-indent:2em">许多流浪狗原本是被主人精心挑选的宠物，但随着时间推移，主人的热情逐渐消退，或因生活变故、经济压力、居住环境限制，甚至仅仅因为狗狗的品种不符合预期，它们便被无情地抛弃。被遗弃的狗狗往往无法理解主人的离去，只能在原地等待，直至被迫踏上流浪之路。</p>                                                                <span><strong>流浪的开始：从家到街头</strong></span><p style="text-indent:2em">被遗弃的狗狗通常对人类充满信任，但突然失去主人的庇护，它们会陷入极度的恐慌和不安。许多狗狗会在原地徘徊数日，甚至数周，试图寻找主人的踪迹。然而，随着时间推移，它们不得不面对残酷的现实：独自在街头求生。没有食物、没有庇护所，流浪生活充满了未知和危险。</p>                                                                    <span><strong>生存的困境：流浪的每一天</strong></span> <p style="text-indent:2em">流浪生活对狗狗来说是巨大的考验。它们需要在垃圾堆中寻找食物，与同类争夺有限的资源；在暴雨、酷暑和严寒中寻找遮蔽之所；还要时刻警惕人类的驱赶甚至伤害。被遗弃的狗狗通常缺乏基本的生存技能，许多在流浪初期就因饥饿、疾病或意外而丧命。那些幸存下来的狗狗，也往往因长期流浪而变得胆小、警惕，甚至对人类充满恐惧。</p>                                                                <span><strong>繁殖与扩散：流浪狗的“后代”</strong></span> <p style="text-indent:2em">被遗弃的狗狗如果未被绝育，会在流浪过程中繁殖后代。这些小狗出生后，同样面临被遗弃或流浪的命运，进一步加剧了流浪狗的数量增长。流浪狗的繁殖失控不仅给它们自身带来了生存压力，也对公共卫生、城市管理提出了严峻挑战。</p>'
      },
      {
        id: 5,
        title: '救狗秘籍：三招搞定',
        date: '2023-10-01',
        coverImage: 'https://ts1.tc.mm.bing.net/th/id/R-C.b0a2a63d01c729048fac87312391569a?rik=7XwL43QTpKj3Pw&riu=http%3a%2f%2fn.sinaimg.cn%2fsinakd10100%2f217%2fw640h377%2f20210119%2f21fc-khxeamv3267553.png&ehk=ibx1%2b8TINWazuEKThbvAAOy9YK3KvgQS2vHZDGXFctc%3d&risl=&pid=ImgRaw&r=0',
        summary: '介绍快速救助流浪狗的三个实用技巧...',
        content: '<p style="text-indent:2em">流浪狗是城市中需要特别关注的群体，它们因被遗弃、走失等原因流落街头，面临着诸多生存挑战。如果你希望帮助这些流浪生命，以下三招科学救助方法可以帮你轻松上手。</p>                                              <span><strong>第一招：安全捕捉</strong></span><p style="text-indent:2em">流浪狗可能因饥饿或恐惧表现出攻击性，因此捕捉时需格外小心： </p> <ul><li><strong>合适的工具：</strong>如捕捉网或笼子，避免直接用手接触。</li><li><strong>食物引诱</strong>如火腿肠或狗粮，让狗狗主动进入笼子。</li></ul><p style="text-indent:2em">  如果狗狗表现出攻击性，不要强行捕捉，可等待其平静后再尝试，或联系专业人员协助。</p>                                                                <span><strong>第二招：初步检查与护理</strong></span><p style="text-indent:2em">捕捉到流浪狗后，进行简单的检查和护理是关键：</p> <ul><li><strong>观察健康状况：</strong>检查是否有外伤、寄生虫或疾病迹象，如皮肤红肿、流脓等。</li><li><strong>提供食物和水：</strong>给予适量易消化的食物和清水，避免过量进食导致肠胃问题。</li><li><strong> 保暖措施：</strong>为狗狗提供温暖、干燥的环境，避免其受凉。</li></ul>                                                               <span><strong>第三招：安置与领养</strong></span><p style="text-indent:2em">救助流浪狗的最终目标是为其找到一个温暖的家： </p> <ul><li><strong> 联系救助机构：</strong>将流浪狗送往当地的动物救助站或收容所，让专业人员继续照顾。</li><li><strong>发布领养信息：</strong>通过社交媒体、宠物领养平台或当地动物保护组织发布信息，帮助狗狗找到合适的领养家庭。</li><li><strong>绝育手术：</strong>建议为流浪狗进行绝育手术，避免其繁殖后代，进一步减少流浪狗数量。</li></ul>                                      <span><strong>结语</strong></span><p style="text-indent:2em">救助流浪狗不仅能为这些无助的生命带来新生，还能减少流浪狗问题对社会的负面影响。通过“三招搞定”的科学救助方法，每个人都能为流浪狗的未来贡献一份力量。希望更多人加入到流浪动物救助的行动中，让爱与温暖在城市中传递。</p>       '
      },
      {
        id: 6,
        title: '领养秘籍：新手必读',
        date: '2023-10-01',
        coverImage: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.9u158YWlGO6geegZLLnzcAHaE8?rs=1&pid=ImgDetMain',
        summary: '为初次领养的小伙伴提供实用的领养知识...',
        content: '<p style="text-indent:2em">领养狗狗是一场温暖的旅程，但新手需要注意一些关键要点。以下是一份简明的领养指南，帮你轻松开启养狗生活。</p>                                                                <span><strong>第一步：明确需求</strong></span><ul><li><strong>时间精力：</strong>确保有足够时间和精力陪伴狗狗。</li><li><strong>经济预算：</strong>养狗需要花费，包括狗粮、医疗、用品等。</li><li><strong>家庭共识：</strong>全家人都要同意领养，共同参与照顾。</li></ul>                                                  <span><strong>第二步：选对品种</strong></span><ul><li><strong>性格匹配：</strong>活泼犬适合爱运动的家庭，安静犬适合宅家。</li><li><strong>体型适配：</strong>根据居住空间选择合适体型的狗狗。</li><li><strong>养护难度：</strong>新手建议选择性格温和、养护简单的品种。</li></ul>                                                                  <span><strong>第三步：做好准备</strong></span><ul><li><strong>生活用品：</strong>狗粮、狗窝、食盆、牵引绳、玩具。</li><li><strong>安全环境：</strong>封好阳台、收好电线，确保狗狗安全。</li><li><strong>心理准备：</strong>养狗是长期责任，需耐心陪伴。</li></ul>                                                                  <span><strong>第四步：迎接新家</strong></span> <ul><li><strong>安静角落：</strong>为狗狗准备一个安静的休息区。</li><li><strong>温和接触：</strong>不要强迫互动，让它自然适应。</li><li><strong>规律作息：</strong>按时喂食、遛狗，帮助它建立规律。</li></ul>                                                               <span><strong>第五步：健康与训练</strong></span><ul><li><strong>健康检查：</strong>领养后尽快带狗狗体检，确保健康。</li><li><strong>简单训练：</strong>教会它“坐下”“握手”等指令。</li><li><strong>社交互动：</strong>带它多接触不同环境，避免胆小。</li></ul>                                                    <span><strong>结语</strong></span><p style="text-indent:2em"> 领养狗狗是一份责任，也是一份快乐。做好准备，用心陪伴，就能和狗狗开启美好的生活。</p>        '
      },
      {
        id: 7,
        title: '流浪狗的社会影响',
        date: '2023-10-01',
        coverImage: 'https://k.sinaimg.cn/n/sinakd10109/217/w640h377/20220610/2208-044f13098f8830399f75a02bfaa2e4f8.png/w700d1q75cms.jpg?by=cms_fixed_width',
        summary: '对公共安全和健康带来的潜在威胁...',
        content: '<p style="text-indent:2em">流浪狗问题已成为城市化进程中一个不容忽视的社会现象，其影响广泛且复杂，涉及公共卫生、社区安全、社会矛盾、动物福利等多个方面。</p>                                                                  <span><strong>公共卫生与健康风险</strong></span><p style="text-indent:2em">流浪狗由于缺乏定期的医疗检查和疫苗接种，常携带狂犬病、寄生虫等疾病，对人类健康构成严重威胁。此外，流浪狗在公共场所随地排泄，不仅破坏环境卫生，还可能滋生细菌和病毒，影响公共卫生。</p>                                                                    <span><strong>社区安全与秩序</strong></span><p style="text-indent:2em">流浪狗的存在增加了社区的安全隐患。它们可能因饥饿或领地意识而攻击人类，尤其是儿童和老年人，导致伤人事件频发。此外，流浪狗在道路上穿行，容易引发交通事故，威胁行人和车辆的安全。</p>                                                                 <span><strong>社会矛盾与冲突</strong></span> <p style="text-indent:2em">流浪狗问题引发了养狗者与非养狗者之间的矛盾。部分养狗者因遗弃宠物导致流浪狗数量增加，而流浪狗的种种行为（如随地排泄、夜间吠叫）又引发了非养狗者的不满，甚至导致邻里纠纷和法律诉讼。</p>                                                                <span><strong>动物福利与伦理问题</strong></span> <p style="text-indent:2em">流浪狗的生存环境恶劣，它们面临着饥饿、疾病、极端天气等多重挑战，生存率极低。此外，流浪狗的无序繁殖进一步加剧了这一问题，导致更多狗狗陷入困境。</p>'
      },
      {
        id: 8,
        title: '流浪狗救助宝典',
        date: '2023-10-01',
        coverImage: 'https://img95.699pic.com/photo/60037/5780.jpg_wh300.jpg!/fh/300/quality/90',
        summary: '提供全面的流浪狗救助知识，从捕捉到安置...',
        content: '<p style="text-indent:2em">流浪狗是城市中需要我们关注和帮助的群体。救助它们不仅能拯救一个个生命，还能让城市更加和谐。以下是流浪狗救助的实用指南，简单易懂，轻松上手。</p>                                              <span><strong>第一步：安全捕捉</strong></span><p style="text-indent:2em">流浪狗可能因恐惧或饥饿表现出攻击性，捕捉时需谨慎：</p> <ul><li>使用笼子或牵引绳，避免直接接触。</li><li>用食物引诱，如火腿肠或狗粮，让狗狗主动靠近。</li><li>如果狗狗攻击性强，不要强行捕捉，可联系专业人员。</li></ul>                                                    <span><strong>第二步：初步护理</strong></span><p style="text-indent:2em">捕捉后，对狗狗进行简单护理：</p> <ul><li>检查伤口，清理并消毒。</li><li>提供温水和少量易消化食物。</li><li>为其提供温暖、干燥的环境。</li></ul>                              <span><strong>第三步：联系救助站</strong></span><p style="text-indent:2em">将流浪狗送往专业的救助站或收容所，让专业人员照顾。如果条件允许，可为狗狗做绝育手术，避免繁殖。</p>                                                          <span><strong>第四步：寻找领养</strong></span><p style="text-indent:2em">通过社交媒体或宠物领养平台发布信息，帮助狗狗找到新家。</p>                    <span><strong>第五步：持续关注</strong></span><p style="text-indent:2em">救助后，关注狗狗的去向，回访领养家庭，确保它们被妥善照顾。</p>                     <span><strong>结语</strong></span> <p style="text-indent:2em"> 救助流浪狗，人人可为。掌握这五个步骤，就能轻松帮助流浪狗找到新家，开启新生活。让我们用爱和行动，为流浪生命点亮希望！ </p>        '
      },
      {
        id: 9,
        title: '领养指南：一文读懂',
        date: '2023-10-01',
        coverImage: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.6nlIqdeHR3gdaj6-NvHTdAHaE7?w=278&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        summary: '全面介绍领养狗狗的要点...',
        content: '<p style="text-indent:2em">想领养狗狗？这篇超简洁的领养指南，带你快速了解关键要点，轻松开启养狗生活。</p>                                                                <span><strong>1. 适合领养吗？</strong></span><ul><li>稳定居住环境。</li><li>有时间和精力陪伴。</li><li>家庭成员都同意。</li></ul>                                                               <span><strong>2. 选哪种狗？</strong></span><ul><li><strong>活泼型：</strong>适合爱运动的你，如拉布拉多、金毛。</li><li><strong>安静型：</strong>适合宅家，如柯基、法斗。</li><li><strong>新手友好：</strong>比熊、柯基，性格温和，养护简单。</li></ul>                                                                  <span><strong>3. 领养前准备什么？</strong></span><ul><li><strong>用品：</strong>狗粮、狗窝、食盆、牵引绳、玩具。</li><li><strong>环境：</strong>封好阳台，收好电线，确保安全。</li></ul>                                                                  <span><strong>4. 狗狗到家后怎么办？</strong></span><ul><li>给它一个安静角落，让它熟悉环境。</li><li>按时喂食、遛狗，建立规律作息。</li><li>不要强迫互动，让它自然亲近你。</li></ul>                                                               <span><strong>5. 领养后要注意什么？</strong></span><ul><li>带它去宠物医院做全面检查。</li><li>按时接种疫苗，定期驱虫。</li><li>用简单指令训练，多鼓励，少惩罚。</li></ul>                                                          <span><strong>结语</strong></span><p style="text-indent:2em">领养狗狗是一份爱与责任，做好准备，用心陪伴，就能开启美好的养狗生活。</p>        '
      }
    ];
    
    // 根据ID查找文章（建议添加空值处理）
    const article = articles.find(item => item.id == id); // 根据ID查找文章
    this.setData({
      article: article,
      isFavorite: wx.getStorageSync(`fav_${id}`) || false // 从本地存储读取收藏状态
    });
  },
  toggleFavorite() {
    const newState = !this.data.isFavorite; // 取反当前状态
    const { article } = this.data; // 获取当前文章数据
    this.setData({ isFavorite: newState });

    if (newState) {
      // 如果收藏，保存完整文章信息到本地存储
      wx.setStorageSync(`fav_${article.id}`, article);
    } else {
      // 如果取消收藏，删除本地存储中的文章信息
      wx.removeStorageSync(`fav_${article.id}`);
    }

    // 显示反馈提示
    wx.showToast({ title: newState ? '收藏成功' : '取消收藏' });
  }
});