
import "./TitlePlayer.css";

import {collectClick, followClick} from "./TitlePlayerFun"

function TitlePlayer(props) {
    const {data, setData} = props;

    return (
        <div className="container title">
          <div className="center-title">
          <h3>{data.title}
            {data.title ? (
              <span 
                onClick={() => collectClick(data, setData)} 
                className={data.isCollect ? 'active' : ''}
              >
                {data.isCollect ? '已收藏' : '+ 收藏'}
              </span>
            ):(<button>导入歌单</button>)
            }
          </h3>


          {data.author 
            && <p>{data.author}
              <span 
                onClick={() => followClick(data, setData)} 
                className={data.isFollow ? 'active' : ''}
              >
                {data.isFollow ? '已关注' : '+ 关注'}
              </span>
            </p>
          }
          </div>
        </div>
    )
}
export default TitlePlayer;