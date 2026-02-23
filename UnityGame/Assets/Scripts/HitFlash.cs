using System.Collections;
using UnityEngine;

public class HitFlash : MonoBehaviour
{
    private Renderer[] _renderers;
    private Color[][] _originalColors;
    private Coroutine _flashRoutine;

    void Awake()
    {
        _renderers = GetComponentsInChildren<Renderer>();
        _originalColors = new Color[_renderers.Length][];
        for (int i = 0; i < _renderers.Length; i++)
        {
            var mats = _renderers[i].materials;
            _originalColors[i] = new Color[mats.Length];
            for (int j = 0; j < mats.Length; j++)
                _originalColors[i][j] = mats[j].color;
        }
    }

    public void Flash()
    {
        if (_flashRoutine != null) StopCoroutine(_flashRoutine);
        _flashRoutine = StartCoroutine(DoFlash());
    }

    private IEnumerator DoFlash()
    {
        // Set red
        foreach (var r in _renderers)
            foreach (var m in r.materials)
                m.color = Color.red;

        yield return new WaitForSeconds(0.15f);

        // Restore
        for (int i = 0; i < _renderers.Length; i++)
        {
            var mats = _renderers[i].materials;
            for (int j = 0; j < mats.Length; j++)
                mats[j].color = _originalColors[i][j];
        }

        _flashRoutine = null;
    }
}
