package phase

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListPhasesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListPhasesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListPhasesLogic {
	return &ListPhasesLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListPhasesLogic) ListPhases(projectID string) (resp []types.PhaseResp, err error) {
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT ph.id, ph.project_id, ph.name, ph.weight, ph.progress,
		       COALESCE(ph.start_date::text,''), COALESCE(ph.end_date::text,''),
		       ph.sort_order, COUNT(t.id) AS task_count
		FROM phases ph
		LEFT JOIN tasks t ON t.phase_id = ph.id
		WHERE ph.project_id = $1
		GROUP BY ph.id
		ORDER BY ph.sort_order`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list phases: %w", err)
	}
	defer rows.Close()

	resp = []types.PhaseResp{}
	for rows.Next() {
		var p types.PhaseResp
		if err = rows.Scan(&p.Id, &p.ProjectId, &p.Name, &p.Weight, &p.Progress,
			&p.StartDate, &p.EndDate, &p.SortOrder, &p.TaskCount); err != nil {
			return nil, fmt.Errorf("failed to scan phase: %w", err)
		}
		resp = append(resp, p)
	}
	return resp, rows.Err()
}
