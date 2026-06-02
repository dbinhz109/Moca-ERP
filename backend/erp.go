// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package main

import (
	"flag"
	"fmt"
	"net/http"
	"strings"

	"github.com/mocatech/erp/internal/config"
	"github.com/mocatech/erp/internal/handler"
	"github.com/mocatech/erp/internal/reminder"
	"github.com/mocatech/erp/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
	"github.com/zeromicro/go-zero/rest/httpx"
)

var configFile = flag.String("f", "etc/erp-api.yaml", "the config file")

func main() {
	flag.Parse()

	// conf.UseEnv cho phép thay thế ${BIẾN_MÔI_TRƯỜNG} trong file cấu hình
	// (Render/Koyeb/Vercel cấp PORT, DATABASE_URL, JWT_SECRET... qua env).
	var c config.Config
	conf.MustLoad(*configFile, &c, conf.UseEnv())

	origins := strings.Split(c.CorsOrigin, ",")
	server := rest.MustNewServer(c.RestConf, rest.WithCors(origins...))
	defer server.Stop()

	// Health check công khai (cho UptimeRobot/cron-job giữ BE không "ngủ").
	server.AddRoute(rest.Route{
		Method: http.MethodGet,
		Path:   "/ping",
		Handler: func(w http.ResponseWriter, r *http.Request) {
			httpx.OkJson(w, map[string]string{"status": "ok"})
		},
	})

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)

	// Nền: nhắc họp 5 phút trước giờ bắt đầu.
	reminder.Start(ctx.DB)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
