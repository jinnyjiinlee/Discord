require('dotenv').config();


const { google } = require('googleapis');
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

 



// 환경 변수 로드
dotenv.config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.once('ready', async () => {
    console.log('디스코드 봇이 준비되었습니다.');

    // Google Sheets API 인증
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json', // 여기에 실제 경로를 입력하세요
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    const spreadsheetId = '1Nsjz_8kMo39-nqkwHmmveXuPQaPIvu_V-QRBu8FP538'; // 여기에 실제 스프레드시트 ID를 입력하세요
    const range = '시트1!A3:B'; // 여기에 실제 범위를 입력하세요


    try {
        // 스프레드시트로부터 데이터 읽기
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        console.log(response.data.values);


        // 스프레드시트에서 읽어온 데이터가 존재하는 경우 실행
        if (response.data.values) {
            // 디스코드 클라이언트의 서버 캐시에서 특정 서버 ID에 해당하는 서버 객체를 가져옵니다.
            const guild = discordClient.guilds.cache.get('1205804309829386280'); // 여기에 실제 디스코드 서버 ID를 입력하세요


            // 스프레드시트에서 읽어온 각 행에 대해 반복 실행합니다. 각 행은 역할 이름과 사용자 이름을 담고 있습니다.
            for (const [roleName, memberName] of response.data.values) {
                // 현재 서버에서 스프레드시트에 명시된 역할 이름에 해당하는 역할 객체를 찾습니다.
                const role = guild.roles.cache.find(r => r.name === roleName);
                console.log('서버역할', roleName)
                // 현재 서버에서 스프레드시트에 명시된 사용자 이름 또는 별명에 해당하는 사용자 객체를 찾습니다.
                const member = guild.members.cache.find(m => m.user.username === memberName || m.nickname === memberName);
                console.log('서버사람멸명', member)

                // 해당 역할과 사용자 객체가 모두 찾아졌다면, 해당 역할을 부여합니다.
                if (role && member) {
                    // 사용자 객체의 roles 속성을 통해 add 매소드를 호출하며, 인자로 해당 역할 객체를 전달하여 역할을 부여합니다.
                    await member.roles.add(role);
                    // 역할이 성공적으로 부여되었음을 콘솔에 로그로 출력합니다.
                    console.log(`${memberName}에게 ${roleName} 역할이 부여되었습니다.`);
                } else {
                    // 역할 또는 사용자를 찾을 수 없는 경우, 콘솔에 해당 내용을 로그로 출력합니다.
                    console.log(`${memberName} 또는 ${roleName}을 찾을 수 없습니다.`);
                }
            }
        }
    } catch (error) {
        console.error('스프레드시트 데이터 읽기 중 오류 발생:', error);
    }
}); // 이 부분에 누락된 닫는 중괄호를 추가

discordClient.login(process.env.DISCORD_TOKEN); // .env 파일에서 봇 토큰 로드
