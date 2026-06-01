// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package config

import (
	"github.com/zeromicro/go-zero/core/stores/cache"
	"github.com/zeromicro/go-zero/rest"
)

type Config struct {
	rest.RestConf
	Auth AuthConfig
	DB   DBConfig
	// Cache không được sử dụng (khai báo theo scaffold) -> optional để production
	// có thể bỏ hẳn mục Cache trong file cấu hình.
	Cache cache.CacheConf `json:",optional"`
	// CorsOrigin: (các) domain Front-end được phép gọi API, phân tách bằng dấu phẩy.
	CorsOrigin string `json:",optional,default=http://localhost:3000"`
}

type AuthConfig struct {
	AccessSecret string
	AccessExpire int64
}

type DBConfig struct {
	DataSource string
}
