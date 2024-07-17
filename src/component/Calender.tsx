import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './../css/calendar.css'
import moment, { MomentInput } from 'moment'
import Calendar from 'react-calendar';
require('moment/locale/ko');


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type FunType = (type: string) => void;
interface BoardProps {
    calendarFuc: FunType
}

interface Schedule {
    _id: string,
    date: string,
    time: string,
    stadium: string,
    end: boolean,
    calendartype: number
}

function CalendarBoard(props: BoardProps) {
    const { calendarFuc } = props;
    // const todayString = moment().format('YYYY-MM-DD')
    const [selectDay, setSelectDay] = useState<string>(""); // 선택한날짜 기본값은 오늘
    const [dayNum, setDayNum] = useState<number>(0); // 기본값 0 / 오른쪽 누를때마다 +1 
    const [dayText, setDayText] = useState<string[]>([]); // standard 날짜 기준으로 +4까지

    useEffect(() => {
        const today = moment();
        const dayArr = [];
        for (var i = 0; i < 4; i++) {
            dayArr.push(today.clone().add(dayNum + i, 'days').format('YYYY-MM-DD'))
        }
        setDayText(dayArr)
    }, [dayNum])

    useEffect(() => {
        calendarFuc(selectDay)
    }, [selectDay])

    async function dayButton(operation: number) {
        await setDayNum((pre) => {
            if (operation === -1) return pre > 0 ? pre - 1 : pre
            if (operation === 1) return pre < 10 ? pre + 1 : pre
            return pre
        })
        return
    }

    return (
        <div className='CalendarBoard-warp'>
            <div
                className={dayNum === 0 ? 'calenderboard-button button_none' : 'calenderboard-button'}
                onClick={() => { dayButton(-1) }}
            ></div>
            <div
                className={selectDay === "" ? 'calenderboard-day day_clicked' : 'calenderboard-day'}
                onClick={() => { setSelectDay("") }}>
                <p>전체보기</p>
            </div>
            {dayText.map((val, idx) => {
                const check_same = (moment(selectDay).isSame(moment(val), 'day'))
                return (
                    <div
                        key={idx}
                        className={check_same ? 'calenderboard-day day_clicked' : 'calenderboard-day'}
                        onClick={() => { setSelectDay(val) }}
                    >
                        <p>{moment(val).format('D')}일</p>
                    </div>
                )
            })}
            <div
                className={dayNum === 10 ? 'calenderboard-button button_none' : 'calenderboard-button'}
                onClick={() => { dayButton(1) }}
            ></div>
        </div>
    )
}

function CalendarMypage() {
    const navigate = useNavigate()

    const [value, onChange] = useState<Value>(new Date());
    const [schedule, setSchedule] = useState<Schedule[]>()
    const [scheduleSelect, setScheduleSelect] = useState<Schedule[]>([])

    useEffect(() => {
        fetch('/api/mypage/calender', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                return res.json().then((err) => {
                    const error = new Error(err.message);
                    err.status = res.status;
                    throw error
                })
            }
        }).then(async (res) => {
            if (res.success) {
                await setSchedule(res.schedule)
                return
            } else {
                return console.log(res)
            }
        }).catch((err) => {
            console.error(`오류코드 ${err.status} = ` + err);
        })

    }, [])

    const selectDate = moment(value as MomentInput).format('YYYY년 M월 D일 dd요일')
    return (
        <div className='CalenderMypage-wrap'>
            <Calendar
                onChange={onChange}
                value={value}
                formatDay={(locale, date) => moment(date).format("D")}
                minDetail="year"
                maxDetail="month"
                tileContent={({ date, view }) => {
                    // calendarType / 1 -> 내가만든 경기 / 2 -> 참여경기 (확정) / 3 -> 참여경기 (미확)
                    var dailySchedule = schedule?.filter(x => moment(x.date).format() === moment(date).format())
                    if (dailySchedule?.length === 0) return;
                    return <div className='calendar-dot-wrap'>
                        {dailySchedule?.map((val, idx) => {
                            return <div
                                key={idx}
                                className='calendar-dot'
                                style={{ background: val.calendartype === 1 ? "blue" : val.calendartype === 2 ? "green" : "red" }} />
                        })}
                    </div>
                }}
                onClickDay={async (value) => {
                    if (schedule === undefined) return
                    const clickDay = schedule?.filter((x) => moment(x.date).isSame(value))
                    setScheduleSelect(clickDay)
                }}
            />
            <div className='calender-schedule'>
                <div className='schedule-title'>
                    <h5>{selectDate} 일정</h5>
                </div>
                <div className='schedule-body'>
                    {scheduleSelect.length === 0 ? <>
                        <div className='schedule-section'>
                            <div className='section-info'>
                                <p>해당 날짜엔 일정이 없습니다.</p>
                            </div>
                        </div>
                    </> : <>
                        {scheduleSelect.map((val, idx) => {
                            return (
                                <div key={idx} className='schedule-section'>
                                    <div className='section-data'>
                                        <div className='dot'
                                            style={{ background: val.calendartype === 1 ? "blue" : val.calendartype === 2 ? "green" : "red" }}
                                        />
                                        <p>{val.date}</p>
                                        <p>{val.time}</p>
                                        <p>{val.stadium}</p>
                                    </div>
                                    <div className='section-link'>
                                        <p 
                                        className='pointer'
                                        onClick={() => {
                                            navigate('/guestpost/' + val._id)
                                        }}>이동</p>
                                    </div>
                                </div>
                            )
                        })}
                    </>}
                </div>
            </div>
        </div>
    )
}



export { CalendarBoard, CalendarMypage }