
import { useNavigate } from "react-router-dom";
import "./../css/modal_team.css"
import { useState } from "react";

const name_team_Reg: RegExp = /^[가-힣]{2,8}$/;
const url_team_Reg: RegExp = /^[a-z]+[a-z0-9]{2,10}$/;

function Modalteam() {
    let navigate = useNavigate();
    const [modalPage, setModalPage] = useState<number>(1)
    // page1
    const [name_createT, setName_createT] = useState<string>("")
    const [url_createT, setUrl_createT] = useState<string>("")
    const [warningPage1_createT, setWarningPage1_createT] = useState<boolean[]>([true, true])
    const [overlappingResult_createT, setOverlappingResult_createT] = useState<boolean[]>([true, true])
    // page2
    const [warningPage2_createT, setWarningPage2_createT] = useState<boolean[]>([true, true])
    // page3
    const [day_createT, setDay_createT] = useState<boolean[]>([false, false, false, false, false, false, false])
    const [time_createT, setTime_createT] = useState<boolean[]>([false, false, false, false])
    const [warningPage3_createT, setWarningPage3_createT] = useState<boolean[]>([true, true])
    //  page4 
    const [area_createT, setArea_createT] = useState<string>("")
    const [stadium_createT, setStadium_createT] = useState<string>("")
    const [warningPage4_createT, setWarningPage4_createT] = useState<boolean[]>([true, true])
    //  page5
    const [age_createT, setAge_createT] = useState<boolean[]>([false, false, false, false, false])
    const [sex_createT, setSex_createT] = useState<boolean[]>([false, false, false])
    const [warningPage5_createT, setWarningPage5_createT] = useState<boolean[]>([true, true])
    //  page6
    const [level_createT, setLevel_createT] = useState<boolean[]>([false, false, false, false, false])
    const [warningPage6_createT, setWarningPage6_createT] = useState<boolean[]>([true])

    const warningArr = [
        warningPage1_createT,
        warningPage2_createT,
        warningPage3_createT,
        warningPage4_createT,
        warningPage5_createT,
        warningPage6_createT,
    ]
    // /////////////////////////////////////////////////////
    // warning 이랑 overlapping 은 false 이면 문제가 있다는 뜻 
    // /////////////////////////////////////////////////////

    function pageNext() {
        if (modalPage !== 6) setModalPage(pre => pre + 1)
        if (modalPage === 6) submit_createT()
        return
    }

    async function checkData(pageNum: number) {
        var warning = await warningArr[pageNum - 1]
        if (pageNum < 0 || pageNum > 6) return;

        var copy: boolean[] | boolean | null;
        copy = await [...warning]

        if (pageNum === 1) {
            await checkData_page1().then(async (res) => {
                copy = await [...res]
                setWarningPage1_createT(copy)
                overlapping_createT()
            }).catch(async (res) => {
                copy = await [...res]
                setWarningPage1_createT(copy)
            })

        } else if (pageNum === 2) {
            
        } else if (pageNum === 3) {
            await checkData_page3().then(async (res) => {
                copy = await [...res]
                setWarningPage3_createT(copy)
                pageNext()
            }).catch(async (res) => {
                copy = await [...res]
                setWarningPage3_createT(copy)
            })
        } else if (pageNum === 4) {
            copy[0] = await area_createT.length === 0 ? false : true
            copy[1] = await stadium_createT.length === 0 ? false : true
            if (area_createT.length >= 1 && stadium_createT.length >= 1) {
                pageNext()
            }
            setWarningPage4_createT(copy)
        } else if (pageNum === 5) {
            await checkData_page5().then(async (res) => {
                copy = await [...res]
                setWarningPage5_createT(copy)
                pageNext()
            }).catch(async (res) => {
                copy = await [...res]
                setWarningPage5_createT(copy)
            })
        } else if (pageNum === 6) {
            await checkData_page6().then(async (res) => {
                copy = await [...res]
                setWarningPage6_createT(copy)
                pageNext()
            }).catch(async (res) => {
                copy = await [...res]
                setWarningPage6_createT(copy)
            })
        }
        return;
    }

    async function checkData_page1() {
        var overlappingResultInitialization = await [true, true]
        await setOverlappingResult_createT(overlappingResultInitialization)
        var nameResult = await name_team_Reg.test(name_createT) ? true : false
        var urlResult = await url_team_Reg.test(url_createT) ? true : false
        return await new Promise<boolean[]>(function (res, rej) {
            if (nameResult && urlResult) {
                res([nameResult, urlResult]);
            } else {
                rej([nameResult, urlResult]);
            }
        })
    }

    async function checkData_page3() {
        var dayResult = await day_createT.includes(true) ? true : false
        var timeResult = await time_createT.includes(true) ? true : false

        return await new Promise<boolean[]>(function (res, rej) {
            if (dayResult && timeResult) {
                res([dayResult, timeResult])
            } else {
                rej([dayResult, timeResult])
            }

        })
    }

    async function checkData_page5() {
        var ageResult = await age_createT.includes(true) ? true : false
        var sexResult = await sex_createT.includes(true) ? true : false

        return await new Promise<boolean[]>(function (res, rej) {
            if (ageResult && sexResult) {
                res([ageResult, sexResult])
            } else {
                rej([ageResult, sexResult])
            }

        })
    }

    async function checkData_page6() {
        var levelResult = await level_createT.includes(true) ? true : false
        return await new Promise<boolean[]>(function (res, rej) {
            if (levelResult) {
                res([levelResult])
            } else {
                rej([levelResult])
            }

        })
    }

    function overlapping_createT() {
        var copy = [...overlappingResult_createT]
        fetch('/api/write/team/overlapping', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name: name_createT,
                url: url_createT
            })
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else if (!res.ok) {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                pageNext()
                return
            } else {
                copy = await [...res.overlapping_result]
                await setOverlappingResult_createT(copy)
                if (res.false_code === 1) {
                    alert('로그인이 만료되었습니다.')
                    return navigate('/login')
                }
                if (res.false_code === 2) {
                    return;
                }
                if (res.false_code === 3) {
                    alert('사용자의 팀이 가득찼습니다. (최대 2팀)')
                    return
                }
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }

    async function submit_createT() {
        fetch('/api/write/team', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name: name_createT,
                url: url_createT,
                day: day_createT,
                time: time_createT,
                area: area_createT,
                stadium: stadium_createT,
                age: age_createT,
                sex: sex_createT,
                level: level_createT
            })
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else if (!res.ok) {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                navigate(`/teampost/${res.team_url}`)
                return;
            } else {
                if (res.false_code === 1) {
                    alert('로그인이 만료되었습니다.')
                    return navigate('/login')
                }
                if (res.false_code === 2) {
                    return;
                }
                if (res.false_code === 3) {
                    alert('사용자의 팀이 가득찼습니다. (최대 2팀)')
                    return
                }
                alert('알 수 없는 문제가 발생하였습니다. 추후에 다시 시도해주시길 바랍니다')
                return
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })
    }




    switch (modalPage) {
        case 1:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step1 team-step">
                        <div className="step1-title step-title">
                            <h6>Step1. 팀 이름과 URL </h6>
                            <p>팀 이름과 URL를 입력해주세요. </p>
                        </div>
                        <div className="step1-name step-form">
                            <p>
                                - 팀 이름을 적어주세요.
                                <span className="red-warning">
                                    {!warningPage1_createT[0] ? "서식에 맞지 않습니다." : ""}
                                    {!overlappingResult_createT[0] ? "이미 있는 팀 이름입니다." : ""}
                                </span>
                            </p>
                            <div className="step-input">
                                <input type="text" name="name" onChange={(e) => {
                                    setName_createT(e.target.value)
                                }}
                                    placeholder="한글 2 ~ 8 글자"
                                    className={!warningPage1_createT[0] || !overlappingResult_createT[0] ? "selected" : ""}
                                    autoComplete="off"
                                ></input>
                            </div>
                        </div>
                        <div className="step1-url step-form">
                            <p>
                                - 팀 Url을 적어주세요.
                                <span className="red-warning">
                                    {!warningPage1_createT[1] ? "서식에 맞지 않습니다." : ""}
                                    {!overlappingResult_createT[1] ? "이미 있는 팀 url입니다." : ""}
                                </span>
                            </p>
                            <div className="step-input">
                                <input type="text" name="url" onChange={(e) => {
                                    setUrl_createT(e.target.value)
                                }}
                                    placeholder="영어 / 숫자 2 ~ 10글자"
                                    style={{ textTransform: "lowercase" }}
                                    className={!warningPage1_createT[1] || !overlappingResult_createT[1] ? "selected" : ""}
                                    autoComplete="off"
                                ></input>
                            </div>
                        </div>
                        <div className="step-button"
                        // onClick={() => { checkData(1) }}
                        >
                            <button
                                onClick={() => { checkData(1) }}
                            >다음으로</button>
                        </div>
                    </div>
                </div>
            )
        case 2:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step2 team-step">
                        <div className="step2-title step-title">
                            <h6>Step2. 주의사항 </h6>
                            <p>팀 작성시 주의사항</p>
                        </div>
                        <div className="step-button" onClick={() => { pageNext() }}>
                            <button>다음으로</button>
                        </div>
                    </div>
                </div>
            )
        case 3:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step3 team-step">
                        <div className="step3-title step-title">
                            <h6>Step3. 주된 시간대 </h6>
                            <p>팀 활동 요일과 시간대를 선택해주세요.</p>
                        </div>
                        <div className="step3-day step-form">
                            <p>
                                - 활동 요일을 선택해주세요.(중복가능)
                                <span className="red-warning">
                                    {!warningPage3_createT[0] ? " 하나 이상의 요일을 선택해주세요 " : ""}
                                </span>
                            </p>
                            <div className="step-select">
                                {['월', '화', '수', '목', '금', '토', '일'].map((val, idx) => {
                                    var copy = [...day_createT]
                                    return <div key={idx}
                                        onClick={() => {
                                            copy[idx] = !copy[idx]
                                            setDay_createT(copy)
                                        }}
                                        className={day_createT[idx] ? "choose" : ""}
                                    ><p>{val}요일</p></div>
                                })}
                            </div>
                        </div>
                        <div className="step3-time step-form">
                            <p>
                                - 활동 시간대를 선택해주세요.(중복불가)
                                <span className="red-warning">
                                    {!warningPage3_createT[1] ? " 하나의 시간대를 선택해주세요 " : ""}
                                </span>
                            </p>
                            <div className="step-select">
                                {['06시~10시 : 아침', "10시~18시 :  낮 ", '18시~24시 : 저녁', '24시~06시 : 심야'].map((val, idx) => {
                                    var copy = [...time_createT]
                                    return <div key={idx}
                                        onClick={() => {
                                            if (time_createT[idx]) {
                                                copy[idx] = !copy[idx]
                                            } else {
                                                copy = copy.map((v, i) => i === idx ? true : false)
                                            }
                                            setTime_createT(copy)
                                        }}
                                        className={time_createT[idx] ? "choose" : ""}
                                    ><p>{val}</p></div>
                                })}
                            </div>
                        </div>
                        <div className="step-button" onClick={() => { checkData(3) }}>
                            <button>다음으로</button>
                        </div>
                    </div>
                </div>
            )
        case 4:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step4 team-step">
                        <div className="step4-title step-title">
                            <h6>Step4. 지역 및 홈그라운드 </h6>
                            <p>활동 지역 및 자주 사용하는 홈그라운드 경기장을 적어주세요.</p>
                        </div>
                        <div className="step4-area step-form">
                            <p>
                                - 주된 활동지역을 적어주세요.
                                <span className="red-warning">
                                    {!warningPage4_createT[0] ? "주된 활동지역을 적어주세요." : ""}
                                </span>
                            </p>
                            <div className="step-input">
                                <input
                                    type="text"
                                    name="area"
                                    placeholder="시 단위까지 입력부탁드립니다. ex)구리시"
                                    onChange={(e) => {
                                        setArea_createT(e.target.value)
                                    }}
                                    autoComplete="off"
                                ></input>
                            </div>
                        </div>
                        <div className="step4-ground step-form">
                            <p>
                                - 주된 사용 경기장을 적어주세요.
                                <span className="red-warning">
                                    {!warningPage4_createT[0] ? "주된 사용 경기장을 적어주세요." : ""}
                                </span>
                            </p>
                            <div className="step-input">
                                <input
                                    type="text"
                                    name="stadium"
                                    placeholder="ex) 구리시 OO 구장"
                                    onChange={(e) => {
                                        setStadium_createT(e.target.value)
                                    }}
                                    autoComplete="off"
                                ></input>
                            </div>
                        </div>
                        <div className="step-button" onClick={() => { checkData(4) }}>
                            <button>다음으로</button>
                        </div>
                    </div>
                </div>
            )
        case 5:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step5 team-step">
                        <div className="step5-title step-title">
                            <h6>Step5. 나이 및 성별 </h6>
                            <p>팀 나이 및 성별을 선택해주세요.</p>
                        </div>
                        <div className="step5-age step-form">
                            <p>
                                - 모집 나이대를 설정해주세요.(중복가능)
                                <span className="red-warning">
                                    {!warningPage5_createT[0] ? " 하나 이상의 나이대를 선택해주세요 " : ""}
                                </span>
                            </p>
                            <div className="step-select">
                                {['10대', '20대', '30대', '40대', '50대이상'].map((val, idx) => {
                                    var copy = [...age_createT]
                                    return <div key={idx}
                                        onClick={() => {
                                            copy[idx] = !copy[idx]
                                            setAge_createT(copy)
                                        }}
                                        className={age_createT[idx] ? "choose" : ""}><p>{val}</p></div>
                                })}
                            </div>
                        </div>
                        <div className="step5-sex step-form">
                            <p>
                                - 모집 성별을 설정해주세요.(중복가능)
                                <span className="red-warning">
                                    {!warningPage5_createT[1] ? " 하나 이상의 성별을 선택해주세요 " : ""}
                                </span>
                            </p>
                            <div className="step-select">
                                {['남성', '여성'].map((val, idx) => {
                                    var copy = [...sex_createT]
                                    return <div key={idx}
                                        onClick={() => {
                                            copy[idx] = !copy[idx]
                                            setSex_createT(copy)
                                        }}
                                        className={sex_createT[idx] ? "choose" : ""}
                                    ><p>{val}</p></div>
                                })}
                            </div>
                        </div>
                        <div className="step-button" onClick={() => { checkData(5) }}>
                            <button>다음으로</button>
                        </div>
                    </div>
                </div>
            )
        case 6:
            return (
                <div className="Modalteam-Wrap">
                    <div className="team-step6 team-step">
                        <div className="step6-title step-title">
                            <h6>Step6. 팀 실력 </h6>
                            <p>팀 실력을 선택해주세요.</p>
                        </div>
                        <div className="step6-level step-form">
                            <p>
                                - 팀 실력을 설정해주세요.(중복불가)
                                <span className="red-warning">
                                    {!warningPage6_createT[0] ? " 하나 이상의 실력대를 선택해주세요 " : ""}
                                </span>
                            </p>
                            <div className="step-select">
                                {['사회인 4부', '사회인 3부', '사회인 2부', '사회인 1부', '취미 수준'].map((val, idx) => {
                                    var copy = [...level_createT]
                                    return <div
                                        key={idx}
                                        onClick={() => {
                                            if (level_createT[idx]) {
                                                copy[idx] = false
                                            } else {
                                                copy = copy.map((v, i) => i === idx ? true : false)
                                            }
                                            setLevel_createT(copy)
                                        }}
                                        className={level_createT[idx] ? "choose" : ""}
                                    ><p>{val}</p></div>
                                })}
                            </div>
                        </div>
                        <div className="step-button" onClick={() => { checkData(6) }}>
                            <button>생성하기</button>
                        </div>
                    </div>
                </div>
            )
        default:
            return (
                <>
                </>
            )
    }
}

export default Modalteam;