
import styles from "./TitlePlayer.module.scss";

import {collectClick, followClick} from "./TitlePlayerFun"

function TitlePlayer(props) {
    const {data, setData} = props;

    return (
          <div className={styles.centerTitle}>
          <p className={styles.p}><span>{data.title}</span>
            {data.title ? (
              <span 
                onClick={() => collectClick(data, setData)} 
                className={data.isCollect ? styles.active : styles.span}
              >
                {data.isCollect ? '已收藏' : '+ 收藏'}
              </span>
            ):(<button>导入歌单</button>)
            }
          </p>

          {data.author 
            && <p className={styles.p}><span>{data.author}</span>
              <span 
                onClick={() => followClick(data, setData)} 
                className={data.isFollow ? styles.active : styles.span}
              >
                {data.isFollow ? '已关注' : '+ 关注'}
              </span>
            </p>
          }
          </div>
    )
}
export default TitlePlayer;