document.addEventListener('DOMContentLoaded', () => {
    const ascensions = [
        '元素使.png', '冠軍.png', '判官.png', '刺客.png', '勇士.png', '守林人.png',
        '守護者.png', '暴徒.png', '死靈師.png', '破壞者.png', '秘術家.png', '聖宗.png',
        '處刑者.png', '衛士.png', '詐欺師.png', '追獵者.png', '酋長.png', '銳眼.png'
    ];

    const startButton = document.getElementById('start-button');
    const animationArea = document.getElementById('animation-area');
    const diceArea = document.getElementById('dice-area');
    const enterSelectionButton = document.createElement('button');
    enterSelectionButton.id = 'enter-selection-button';
    enterSelectionButton.textContent = '進入選擇階段';
    enterSelectionButton.style.display = 'none';
    document.body.appendChild(enterSelectionButton);
    const team1 = document.getElementById('team1');
    const team2 = document.getElementById('team2');
    const ascensionsDiv = document.getElementById('ascensions');
    const progressDiv = document.getElementById('progress');

    let winner, loser;
    let currentStep = 0;
    let currentTeam;
    let pickSequence = [];
    let isPicking = false; // 新增變數，用於防止快速點擊

    // 預設昇華使徒
    const apostle = document.createElement('img');
    apostle.src = '昇華使徒.png';
    apostle.alt = '昇華使徒';
    team1.querySelector('.selections').appendChild(apostle.cloneNode(true));
    team2.querySelector('.selections').appendChild(apostle.cloneNode(true));

    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        diceArea.style.display = 'flex';
        rollDice();
    });

    enterSelectionButton.addEventListener('click', () => {
        diceArea.style.display = 'none';
        enterSelectionButton.style.display = 'none';
        setupPickSequence();
        setupAscensions();
        setupProgress();
        nextPick();
    });

    // LOGO特效輔助
    function setLogoActive(team) {
        document.querySelectorAll('.logo').forEach(l => l.classList.remove('active-pick'));
        document.querySelector(`#${team} .logo`).classList.add('active-pick');
    }
    function clearLogoActive() {
        document.querySelectorAll('.logo').forEach(l => l.classList.remove('active-pick'));
    }

    function rollDice() {
        // 先清空點數，顯示動畫
        displayDice('team1-dice', 0);
        displayDice('team2-dice', 0);
        document.querySelectorAll('.dice').forEach(d => {
            d.classList.remove('hidden-border');
            d.classList.add('rolling');
        });
        let rollCount = 0;
        const maxRolls = 15; // 骰動次數
        const rollInterval = setInterval(() => {
            const randomDice1 = Math.floor(Math.random() * 6) + 1;
            const randomDice2 = Math.floor(Math.random() * 6) + 1;
            displayDice('team1-dice', randomDice1);
            displayDice('team2-dice', randomDice2);
            rollCount++;
            if (rollCount >= maxRolls) {
                clearInterval(rollInterval);
                const finalDice1 = Math.floor(Math.random() * 6) + 1;
                const finalDice2 = Math.floor(Math.random() * 6) + 1;
                displayDice('team1-dice', finalDice1);
                displayDice('team2-dice', finalDice2);
                document.querySelectorAll('.dice').forEach(d => {
                    d.classList.remove('rolling');
                    d.classList.add('hidden-border');
                });
                if (finalDice1 > finalDice2) {
                    winner = 'team1';
                    loser = 'team2';
                } else if (finalDice2 > finalDice1) {
                    winner = 'team2';
                    loser = 'team1';
                } else {
                    // 平手，重擲
                    setTimeout(rollDice, 1000); 
                    return;
                }
                enterSelectionButton.style.display = 'block';
            }
        }, 100); // 每100毫秒更新一次骰面
    }

    function displayDice(id, num) {
        const dice = document.getElementById(id);
        dice.innerHTML = '';
        if (num < 1 || num > 6) return;
        const positions = {
            1: [[1,1]],
            2: [[0,0], [2,2]],
            3: [[0,0], [1,1], [2,2]],
            4: [[0,0], [0,2], [2,0], [2,2]],
            5: [[0,0], [0,2], [1,1], [2,0], [2,2]],
            6: [[0,0], [0,1], [0,2], [2,0], [2,1], [2,2]]
        };
        positions[num].forEach(pos => {
            const pip = document.createElement('div');
            pip.classList.add('pip');
            pip.style.gridRow = pos[0] + 1;
            pip.style.gridColumn = pos[1] + 1;
            dice.appendChild(pip);
        });
    }

    function nextPick() {
        if (currentStep >= pickSequence.length) {
            clearLogoActive();
            return;
        }
        const step = pickSequence[currentStep];
        currentTeam = step.team;
        remainingPicks = step.picks;
        updateProgress();
        setLogoActive(currentTeam);
    }

    function selectAscension(container) {
        if (isPicking || remainingPicks <= 0 || !container.parentElement) return; // 如果正在處理選擇，則直接返回
        isPicking = true; // 開始處理選擇，設置為 true
        const img = container.querySelector('img');
        const target = document.getElementById(currentTeam).querySelector('.selections');
        
        // 動畫效果
        container.style.transition = 'all 1s cubic-bezier(0.4,0,0.2,1)';
        container.style.transform = `translate(${currentTeam === 'team1' ? '-50%' : '50%'}, -50%) scale(1.3)`;
        container.style.opacity = '0';
        
        setTimeout(() => {
            // 只移動圖片到隊伍區域
            target.appendChild(img);
            // 重置圖片的樣式，避免變形
            img.style.transition = '';
            img.style.transform = '';
            img.style.opacity = '';
            container.remove();
        }, 1000);
        
            setTimeout(() => {
                remainingPicks--;
                isPicking = false; // 選擇處理完成，設置為 false
                if (remainingPicks === 0) {
                    currentStep++;
                    nextPick();
                }
            }, 1000);
    }

    function setupProgress() {
        progressDiv.innerHTML = '';
        pickSequence.forEach((step, index) => {
            const prog = document.createElement('div');
            prog.classList.add('progress-step');
            prog.classList.add(step.team); // 根據隊伍加顏色
            const teamLabel = document.createElement('span');
            teamLabel.classList.add('team-label');
            teamLabel.textContent = step.team === 'team1' ? '藍隊' : '紅隊';
            const picksLabel = document.createElement('span');
            picksLabel.textContent = `${step.picks}選`;
            prog.appendChild(teamLabel);
            prog.appendChild(picksLabel);
            progressDiv.appendChild(prog);
        });
        progressDiv.style.display = 'flex';
    }

    let remainingPicks = 0;
    function nextPick() {
        if (currentStep >= pickSequence.length) {
            // 選取結束，顯示結算介面
            showFinalResult();
            return;
        }
        const step = pickSequence[currentStep];
        currentTeam = step.team;
        remainingPicks = step.picks;
        updateProgress();

        // 根據當前選取隊伍添加或移除 active-pick 類別
        if (currentTeam === 'team1') {
            document.getElementById('team1').classList.add('active-pick');
            document.getElementById('team2').classList.remove('active-pick');
        } else {
            document.getElementById('team2').classList.add('active-pick');
            document.getElementById('team1').classList.remove('active-pick');
        }

        // 更新進度條的 active 狀態
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function updateProgress() {
        const steps = progressDiv.querySelectorAll('.progress-step');
        steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));
    }
    // 補上選角順序設定
    function setupPickSequence() {
        // 新的選取順序
        pickSequence = [
            { team: winner, picks: 1 },
            { team: loser, picks: 2 },
            { team: winner, picks: 1 },
            { team: loser, picks: 1 },
            { team: winner, picks: 2 },
            { team: loser, picks: 1 },
            { team: winner, picks: 1 },
            { team: loser, picks: 2 },
            { team: winner, picks: 2 },
            { team: loser, picks: 1 },
            { team: winner, picks: 1 },
            { team: loser, picks: 1 },
            { team: winner, picks: 1 },
            { team: loser, picks: 1 }
        ];
        currentStep = 0;
    }

    function showFinalResult() {
        // 隱藏所有現有UI元素
        diceArea.style.display = 'none';
        ascensionsDiv.style.display = 'none';
        progressDiv.style.display = 'none';
        enterSelectionButton.style.display = 'none';
        
        // 移除所有選取特效
        document.querySelectorAll('.team').forEach(team => {
            team.classList.remove('active-pick');
        });
        document.querySelectorAll('.logo').forEach(logo => {
            logo.classList.remove('active-pick');
        });

        // 重新設置隊伍區塊樣式
        const teamsBlock = document.getElementById('teams-block');
        teamsBlock.style.top = '50%';
        teamsBlock.style.transform = 'translate(-50%, -50%)';
        teamsBlock.style.background = 'rgba(30, 30, 50, 0.95)';
        teamsBlock.style.padding = '40px';

        // 為每個隊伍創建昇華列表
        ['team1', 'team2'].forEach(teamId => {
            const team = document.getElementById(teamId);
            const selections = team.querySelector('.selections');
            const ascensionList = document.createElement('div');
            ascensionList.className = 'ascension-list';
            
            // 獲取所有昇華圖片
            const images = selections.getElementsByTagName('img');
            Array.from(images).forEach(img => {
                const ascensionItem = document.createElement('div');
                ascensionItem.className = 'ascension-item';
                
                const name = document.createElement('span');
                name.className = 'ascension-name';
                name.textContent = img.alt;
                
                ascensionItem.appendChild(img.cloneNode(true));
                ascensionItem.appendChild(name);
                ascensionList.appendChild(ascensionItem);
            });
            
            // 清空原有的selections並添加新的列表
            selections.innerHTML = '';
            selections.appendChild(ascensionList);
            
            // 添加隊伍標題
            const teamTitle = document.createElement('h2');
            teamTitle.className = 'team-title';
            teamTitle.textContent = teamId === 'team1' ? '夏烏拉昇華' : '賽勒斯昇華';
            team.insertBefore(teamTitle, selections);
        });

        // 添加結算標題
        const resultTitle = document.createElement('h1');
        resultTitle.id = 'result-title';
        resultTitle.textContent = '選角結果';
        document.body.insertBefore(resultTitle, teamsBlock);
    }

    function setupAscensions() {
        ascensionsDiv.innerHTML = '';
        ascensionsDiv.style.display = 'grid';
        ascensionsDiv.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        ascensionsDiv.style.gap = '20px';
        
        ascensions.forEach(ascension => {
            const container = document.createElement('div');
            container.className = 'ascension-container';
            
            const img = document.createElement('img');
            img.src = ascension;
            img.alt = ascension.split('.')[0];
            
            const name = document.createElement('div');
            name.className = 'ascension-name';
            name.textContent = img.alt;
            
            container.appendChild(img);
            container.appendChild(name);
            container.addEventListener('click', () => selectAscension(container));
            
            ascensionsDiv.appendChild(container);
        });
    }
});